/* eslint-env mocha */
import { assert } from 'chai'
import { createBookableSlots } from './createBookableSlots'

// Minimal in-memory fake of the Appointments collection.
const fakeAppointments = (existing = []) => {
  const inserted = []
  return {
    inserted,
    find: () => ({ fetch: () => existing }),
    findOne: (sel) => inserted.find(a =>
      a.assigneeId === sel.assigneeId &&
      a.type === 'bookable' &&
      a.start.getTime() === sel.start.getTime() &&
      a.end.getTime() === sel.end.getTime()
    ) || null,
    insert: (doc) => { inserted.push(doc); return String(inserted.length) }
  }
}

const day = { year: 2026, month: 9, day: 2 }

describe('createBookableSlots', function () {
  it('creates one bookable per slot within the range', function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })

    const created = make({
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

  it('skips slots overlapping a blocked range (e.g. partial vacation)', function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })

    // Block 09:00–09:30
    const block = {
      start: new Date(2026, 8, 2, 9, 0, 0),
      end: new Date(2026, 8, 2, 9, 30, 0)
    }

    const created = make({
      calendar: { slotSize: 30 },
      calendarId: 'cal1',
      userId: 'u1',
      day,
      ranges: [{ from: { h: 8, m: 0 }, to: { h: 10, m: 0 } }],
      blockedRanges: [block]
    })

    assert.equal(created, 3)
  })

  it('does nothing without ranges', function () {
    const Appointments = fakeAppointments()
    const make = createBookableSlots({ Appointments })
    assert.equal(make({ calendar: {}, calendarId: 'c', userId: 'u', day, ranges: [] }), 0)
  })
})
