/* eslint-env mocha */
import assert from 'assert'
import moment from 'moment-timezone'
import { aggregate, computePatientFlow, weekdayIndex, hourOf, monthKey, WEEKDAYS } from './computePatientFlow'

// A fixed "now" well in the future so every fixture appointment counts as past
// (so no-show/kept logic is exercised deterministically).
const NOW = new Date('2027-01-01T00:00:00Z')

// Build an appointment at a given Vienna wall-clock time.
const at = (isoLocal, extra = {}) => ({
  start: moment.tz(isoLocal, 'Europe/Vienna').toDate(),
  end: moment.tz(isoLocal, 'Europe/Vienna').add(15, 'minutes').toDate(),
  admittedAt: new Date(), // kept by default
  ...extra
})

describe('reports/methods/computePatientFlow', function () {
  it('buckets weekday/hour in Europe/Vienna, not UTC', function () {
    // 00:30 Vienna on Mon 2026-06-15 is 22:30 UTC the previous Sunday.
    const d = moment.tz('2026-06-15T00:30', 'Europe/Vienna').toDate()
    assert.equal(weekdayIndex(d), 0) // Monday
    assert.equal(hourOf(d), 0)
    assert.equal(monthKey(d), '2026-06')
  })

  it('fills the weekday × hour heatmap with expected (non-canceled) volume', function () {
    const appts = [
      at('2026-06-15T09:00'), // Mon 09
      at('2026-06-15T09:10'), // Mon 09
      at('2026-06-16T14:00'), // Tue 14
      at('2026-06-15T09:20', { canceled: true }) // canceled → excluded from heatmap
    ]
    const { heatmap } = aggregate(appts, { now: NOW })
    assert.deepEqual(heatmap.weekdays, WEEKDAYS)
    assert.equal(heatmap.matrix[0][9], 2) // Mon 09:00
    assert.equal(heatmap.matrix[1][14], 1) // Tue 14:00
  })

  it('groups by month and splits online vs internal', function () {
    const appts = [
      at('2026-06-15T09:00', { createdViaPortal: true }),
      at('2026-06-20T09:00'),
      at('2026-07-01T09:00', { createdViaPortal: true })
    ]
    const res = aggregate(appts, { now: NOW })
    assert.equal(res.total, 3)
    assert.equal(res.online, 2)
    assert.equal(res.internal, 1)
    assert.equal(res.onlineShare, 2 / 3)
    assert.equal(res.months.length, 2)
    assert.equal(res.months[0].month, '2026-06')
    assert.equal(res.months[0].online, 1)
    assert.equal(res.months[1].month, '2026-07')
  })

  it('computes no-shows from admittedAt/canceled (not a DB flag)', function () {
    const appts = [
      at('2026-06-15T09:00'), // kept (admittedAt set)
      at('2026-06-15T10:00', { admittedAt: null }), // no-show
      at('2026-06-15T11:00', { admittedAt: null, canceled: true }) // canceled, not a no-show
    ]
    const res = aggregate(appts, { now: NOW })
    assert.equal(res.kept, 1)
    assert.equal(res.noShow, 1)
    assert.equal(res.canceled, 1)
    assert.equal(res.expected, 2)
    assert.equal(res.noShowRate, 1 / 2) // 1 no-show of 2 past-expected
  })

  it('does not count future appointments as no-shows', function () {
    const past = at('2026-06-15T09:00', { admittedAt: null }) // past no-show
    const future = at('2026-12-31T09:00', { admittedAt: null }) // future, not yet
    const res = aggregate([past, future], { now: new Date('2026-07-01T00:00:00Z') })
    assert.equal(res.noShow, 1)
    assert.equal(res.total, 2)
  })

  describe('computePatientFlow (cohorts)', function () {
    // Minimal in-memory stand-in for a Mongo collection supporting the operators
    // computePatientFlow uses ($exists/$ne/$in/$nin/$gte/$lte, tags $in).
    const matchField = (value, cond) => {
      if (cond && typeof cond === 'object' && !(cond instanceof Date)) {
        if ('$exists' in cond && (value !== undefined) !== cond.$exists) { return false }
        if ('$ne' in cond && value === cond.$ne) { return false }
        if ('$in' in cond) {
          const arr = Array.isArray(value) ? value : [value]
          if (!cond.$in.some(x => arr.includes(x))) { return false }
        }
        if ('$nin' in cond && cond.$nin.includes(value)) { return false }
        if ('$gte' in cond && !(value >= cond.$gte)) { return false }
        if ('$lte' in cond && !(value <= cond.$lte)) { return false }
        return true
      }
      return value === cond
    }
    const makeColl = (docs) => ({
      find: (selector = {}) => ({
        fetch: () => docs.filter(d => Object.keys(selector).every(k => matchField(d[k], selector[k])))
      })
    })

    const appt = (isoLocal, extra = {}) => ({
      ...at(isoLocal, extra),
      patientId: extra.patientId || 'p',
      removed: false
    })

    it('returns one cohort per series with filtered current aggregates', function () {
      const Appointments = makeColl([
        appt('2026-06-15T09:00', { assigneeId: 'dr-a', tags: ['t1'] }),
        appt('2026-06-16T09:00', { assigneeId: 'dr-a', tags: ['t2'] }),
        appt('2026-06-17T09:00', { assigneeId: 'dr-b', tags: ['t1'] })
      ])
      const Users = makeColl([])

      const res = computePatientFlow({
        Appointments,
        Users,
        series: [
          { id: 'c1', label: 'Dr. A', from: new Date('2026-06-01'), to: new Date('2026-06-30'), assigneeIds: ['dr-a'] },
          { id: 'c2', label: 'Typ t1', from: new Date('2026-06-01'), to: new Date('2026-06-30'), tags: ['t1'] }
        ],
        now: NOW
      })

      assert.equal(res.compare, false)
      assert.equal(res.series.length, 2)
      assert.equal(res.series[0].id, 'c1')
      assert.equal(res.series[0].current.total, 2) // both dr-a appointments
      assert.equal(res.series[0].previous, null)
      assert.equal(res.series[1].current.total, 2) // both t1 appointments
    })

    it('honors hiddenInReports and excludes those doctors', function () {
      const Appointments = makeColl([
        appt('2026-06-15T09:00', { assigneeId: 'dr-a' }),
        appt('2026-06-16T09:00', { assigneeId: 'dr-hidden' })
      ])
      const Users = makeColl([{ _id: 'dr-hidden', hiddenInReports: true }])

      const res = computePatientFlow({
        Appointments,
        Users,
        series: [{ id: 'c1', label: 'Alle', from: new Date('2026-06-01'), to: new Date('2026-06-30') }],
        now: NOW
      })
      assert.equal(res.series[0].current.total, 1) // hidden doctor excluded
    })

    it('adds a previous-year aggregate per cohort when compare is set', function () {
      const Appointments = makeColl([
        appt('2026-06-15T09:00', { assigneeId: 'dr-a' }),
        appt('2025-06-15T09:00', { assigneeId: 'dr-a' }),
        appt('2025-06-20T09:00', { assigneeId: 'dr-a' })
      ])
      const Users = makeColl([])

      const res = computePatientFlow({
        Appointments,
        Users,
        compare: true,
        series: [{ id: 'c1', label: 'Dr. A', from: new Date('2026-06-01T00:00:00'), to: new Date('2026-06-30T23:59:59'), assigneeIds: ['dr-a'] }],
        now: NOW
      })
      assert.equal(res.compare, true)
      assert.equal(res.series[0].current.total, 1) // 2026
      assert.ok(res.series[0].previous)
      assert.equal(res.series[0].previous.total, 2) // 2025 same window
    })
  })

  it('builds an online-only lead-time histogram', function () {
    const online = at('2026-06-15T09:00', {
      createdViaPortal: true,
      createdAt: moment.tz('2026-06-13T09:00', 'Europe/Vienna').toDate() // 2 days ahead
    })
    const internal = at('2026-06-15T09:00', {
      createdAt: moment.tz('2026-05-15T09:00', 'Europe/Vienna').toDate()
    })
    const res = aggregate([online, internal], { now: NOW })
    assert.equal(res.leadTime.total, 1) // only the online appointment
    assert.equal(res.leadTime.counts[1], 1) // 1–3 days bin
    // exact-day distribution: 1 online booking exactly 2 days ahead
    assert.equal(res.leadDays.max, 2)
    assert.equal(res.leadDays.counts[2], 1)
    assert.equal(res.leadDays.counts[0], 0)
  })
})
