/* eslint-env mocha */
import assert from 'assert'
import moment from 'moment-timezone'
import { aggregate, weekdayIndex, hourOf, monthKey, WEEKDAYS } from './computePatientFlow'

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
