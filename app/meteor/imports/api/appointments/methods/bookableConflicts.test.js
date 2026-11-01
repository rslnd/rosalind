/* eslint-env mocha */
import { assert } from 'chai'
import { overlapsAnyAppointment } from './bookableConflicts'

const t = (h, m) => new Date(2026, 10, 2, h, m)
const bookable = { calendarId: 'c', assigneeId: 'u', start: t(8, 0), end: t(8, 10) }
const appt = (fields) => ({ calendarId: 'c', assigneeId: 'u', start: t(8, 5), end: t(8, 20), ...fields })

describe('bookableConflicts', function () {
  it('detects a partially overlapping appointment', function () {
    assert.isTrue(overlapsAnyAppointment(bookable, [appt()]))
  })

  it('ignores adjacent appointments', function () {
    assert.isFalse(overlapsAnyAppointment(bookable, [appt({ start: t(8, 10), end: t(8, 20) })]))
  })

  it('ignores other columns, canceled appointments, bookables and locks', function () {
    assert.isFalse(overlapsAnyAppointment(bookable, [
      appt({ assigneeId: 'other' }),
      appt({ calendarId: 'other' }),
      appt({ canceled: true }),
      appt({ type: 'bookable' }),
      appt({ type: 'lock' })
    ]))
  })
})
