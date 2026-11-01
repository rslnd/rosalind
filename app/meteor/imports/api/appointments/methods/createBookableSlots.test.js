/* eslint-env mocha */
import { assert } from 'chai'
import moment from 'moment-timezone'
import { createBookableSlots } from './createBookableSlots'
import { applyHM } from '../../schedules/methods/transformDefaultsToOverrides'

// Minimal in-memory fake of the Appointments collection.
const fakeAppointments = (existing = []) => {
  const inserted = []
  return {
    inserted,
    find: () => ({ fetchAsync: async () => existing }),
    findOneAsync: async (sel) => inserted.find(a =>
      a.assigneeId === sel.assigneeId &&
      a.type === 'bookable' &&
      a.start.getTime() === sel.start.getTime() &&
      a.end.getTime() === sel.end.getTime()
    ) || null,
    insertAsync: async (doc) => { inserted.push(doc); return String(inserted.length) }
  }
}

const day = { year: 2026, month: 9, day: 2 }

describe('createBookableSlots', async function () {
  it('creates one bookable per slot within the range', async function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })

    const created = await make({
      calendar: { slotSize: 30 },
      calendarId: 'cal1',
      userId: 'u1',
      day,
      ranges: [{ from: { h: 8, m: 0 }, to: { h: 10, m: 0 } }]
    })

    assert.equal(created, 4) // 08:00, 08:30, 09:00, 09:30
    assert.equal(Appointments.inserted.length, 4)
    assert.equal(Appointments.inserted[0].type, 'bookable')
  })

  it('skips slots overlapping a blocked range (e.g. partial vacation)', async function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })

    // Block 09:00–09:30 (built in the same Europe/Vienna basis as the slots so
    // the test is timezone-independent).
    const block = {
      start: applyHM(day, { h: 9, m: 0 }),
      end: applyHM(day, { h: 9, m: 30 })
    }

    const created = await make({
      calendar: { slotSize: 30 },
      calendarId: 'cal1',
      userId: 'u1',
      day,
      ranges: [{ from: { h: 8, m: 0 }, to: { h: 10, m: 0 } }],
      blockedRanges: [block]
    })

    assert.equal(created, 3)
  })

  it('creates non-overlapping slots on the grid when slotSize exceeds the atMinutes gaps', async function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })

    await make({
      calendar: { slotSize: 15, atMinutes: [0, 10, 15, 20, 30, 40, 45, 50] },
      calendarId: 'cal1',
      userId: 'u1',
      day,
      ranges: [{ from: { h: 14, m: 0 }, to: { h: 15, m: 0 } }]
    })

    const fmt = d => moment(d).tz('Europe/Vienna').format('HH:mm')
    assert.deepEqual(
      Appointments.inserted.map(a => `${fmt(a.start)}-${fmt(a.end)}`),
      ['14:00-14:10', '14:10-14:15', '14:15-14:20', '14:20-14:30', '14:30-14:40', '14:40-14:45', '14:45-14:50', '14:50-15:00']
    )
  })

  it('drops a slot sticking out of an off-grid range end instead of cutting it short', async function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })

    const created = await make({
      calendar: { slotSize: 10 },
      calendarId: 'cal1',
      userId: 'u1',
      day,
      ranges: [{ from: { h: 8, m: 3 }, to: { h: 8, m: 45 } }]
    })

    assert.equal(created, 3) // 08:10, 08:20, 08:30 (08:40–08:50 sticks out)
  })

  it('skips slots before notBefore', async function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })

    const created = await make({
      calendar: { slotSize: 30 },
      calendarId: 'cal1',
      userId: 'u1',
      day,
      ranges: [{ from: { h: 8, m: 0 }, to: { h: 10, m: 0 } }],
      notBefore: applyHM(day, { h: 9, m: 0 })
    })

    assert.equal(created, 2)
  })

  it('never creates a slot overlapping an appointment, also partially', async function () {
    const appointment = {
      type: 'appointment',
      start: applyHM(day, { h: 8, m: 5 }),
      end: applyHM(day, { h: 8, m: 20 })
    }
    const Appointments = fakeAppointments([appointment])
    const make = createBookableSlots({ Appointments })

    await make({
      calendar: { slotSize: 10 },
      calendarId: 'cal1',
      userId: 'u1',
      day,
      ranges: [{ from: { h: 8, m: 0 }, to: { h: 9, m: 0 } }]
    })

    assert.equal(Appointments.inserted.length, 4) // 08:20 .. 08:50
    Appointments.inserted.forEach(b =>
      assert.isFalse(b.start < appointment.end && b.end > appointment.start))
  })

  it('finds the appointments of the whole day when the server runs in UTC', async function () {
    moment.tz.setDefault('UTC')
    try {
      // 18:40–18:50 Vienna = 17:40–17:50 UTC; the Vienna day starts at 23:00 UTC the day before
      const appointment = {
        type: 'appointment',
        start: new Date('2026-09-02T16:40:00Z'),
        end: new Date('2026-09-02T16:50:00Z')
      }
      let selector
      const Appointments = fakeAppointments([appointment])
      const find = Appointments.find
      Appointments.find = sel => { selector = sel; return find(sel) }

      await createBookableSlots({ Appointments })({
        calendar: { slotSize: 10 },
        calendarId: 'cal1',
        userId: 'u1',
        day,
        ranges: [{ from: { h: 18, m: 0 }, to: { h: 19, m: 0 } }]
      })

      // 2026-09-02 in Vienna (CEST): 2026-09-01T22:00Z – 2026-09-02T21:59:59.999Z
      assert.equal(selector.end.$gt.toISOString(), '2026-09-01T22:00:00.000Z')
      assert.equal(selector.start.$lt.toISOString(), '2026-09-02T21:59:59.999Z')
      assert.equal(Appointments.inserted.length, 5)
      Appointments.inserted.forEach(b =>
        assert.isFalse(b.start < appointment.end && b.end > appointment.start))
    } finally {
      moment.tz.setDefault()
    }
  })

  it('does nothing without ranges', async function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })
    assert.equal(await make({ calendar: {}, calendarId: 'c', userId: 'u', day, ranges: [] }), 0)
  })
})
