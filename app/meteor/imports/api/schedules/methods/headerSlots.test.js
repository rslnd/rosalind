/* eslint-env mocha */
import { expect } from 'chai'
import moment from 'moment-timezone'
import { headerSlots, headerAvailabilities } from './headerSlots'

const day = { year: 2026, month: 11, day: 10 }
const at = (h, m) => moment.tz({ year: 2026, month: 10, date: 10, hour: h, minute: m }, 'Europe/Vienna').toDate()

describe('schedules/methods/headerSlots', function () {
  // 7:30–21:00 in 10-minute slots = 81 slots; working 8:00–13:00 = 30 slots
  const calendar = { slotSize: 10 }
  const schedules = [
    { start: at(7, 30), end: at(8, 0) },
    { start: at(13, 0), end: at(21, 0) }
  ]

  it('counts the slots outside blocking schedules', function () {
    expect(headerSlots({ day, calendar, schedules })).to.deep.equal({ slotsAvailable: 30, slotsUsed: 0 })
  })

  it('counts slots covered by appointments as used, ignoring bookables', function () {
    const appointments = [
      { start: at(8, 0), end: at(12, 0) },
      { start: at(12, 0), end: at(12, 30), type: 'bookable' }
    ]
    expect(headerSlots({ day, calendar, schedules, appointments })).to.deep.equal({ slotsAvailable: 30, slotsUsed: 24 })
  })

  it('ignores available and role-restricted schedules', function () {
    const extra = [
      { start: at(8, 0), end: at(9, 0), available: true },
      { start: at(9, 0), end: at(10, 0), roles: ['x'] }
    ]
    expect(headerSlots({ day, calendar, schedules: [...schedules, ...extra] }).slotsAvailable).to.equal(30)
  })

  it('honors atMinutes', function () {
    expect(headerSlots({ day, calendar: { slotSize: 10, atMinutes: [0, 30] }, schedules }).slotsAvailable).to.equal(10)
  })

  describe('headerAvailabilities', function () {
    it('returns one period per working block with header slot counts', function () {
      const appointments = [{ start: at(8, 0), end: at(12, 0) }]
      const [period, ...rest] = headerAvailabilities({ day, calendar, schedules, appointments })
      expect(rest).to.have.length(0)
      expect(period.from).to.deep.equal(at(8, 0))
      expect(period.to).to.deep.equal(at(13, 0))
      expect(period.slotsAvailable).to.equal(30)
      expect(period.slotsUsed).to.equal(24)
      expect(period.pauses).to.equal(undefined)
    })

    it('keeps short breaks as pauses and splits at long ones', function () {
      const withBreaks = [
        { start: at(7, 30), end: at(8, 0) },
        { start: at(10, 0), end: at(10, 30) }, // pause
        { start: at(12, 0), end: at(14, 0) }, // split
        { start: at(16, 0), end: at(21, 0) }
      ]
      const periods = headerAvailabilities({ day, calendar, schedules: withBreaks })
      expect(periods.map(p => [p.from, p.to])).to.deep.equal([
        [at(8, 0), at(12, 0)],
        [at(14, 0), at(16, 0)]
      ])
      expect(periods[0].slotsAvailable).to.equal(21)
      expect(periods[0].pauses).to.deep.equal([{ from: at(10, 0), to: at(10, 30), slots: 3 }])
      expect(periods[1].slotsAvailable).to.equal(12)
    })
  })
})
