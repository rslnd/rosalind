/* eslint-env mocha */
import { expect } from 'chai'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { isQuietTime, isHolidays } from './isQuietTime'

const moment = extendMoment(momentTz)

describe('api', () => {
  describe('messages', () => {
    describe('isQuietTime', () => {
      it('true on sundays', () => {
        expect(isQuietTime(moment().isoWeekday('Sunday').hour(13))).to.equal(true)
      })

      it('true at night', () => {
        expect(isQuietTime(moment().isoWeekday(2).hour(3))).to.equal(true)
      })

      it('false during the day', () => {
        expect(isQuietTime(moment().isoWeekday(2).hour(12))).to.equal(false)
      })
    })

    describe('isHolidays', () => {
      const holidays = [
        { start: '2017-02-01T00:00:00.000', end: '2017-02-01T23:59:59.999' },
        { start: '2017-12-25T00:00:00.000', end: '2017-12-25T23:59:59.999' },
        { start: '2017-12-26T00:00:00.000', end: '2018-01-06T23:59:59.999' }
      ]

      const isH = isHolidays(holidays)

      const yes1 = moment('2017-02-01T10:15:00.000')
      const yes2 = moment('2017-12-27T10:15:00.000')
      const yes3 = moment('2018-01-02T10:15:00.000')

      const no1 = moment('2017-12-24T23:59:59.999')
      const no2 = moment('2017-03-01T10:15:00.000')

      expect(isH(yes1)).to.equal(true)
      expect(isH(yes2)).to.equal(true)
      expect(isH(yes3)).to.equal(true)
      expect(isH(no1)).to.equal(false)
      expect(isH(no2)).to.equal(false)
    })
  })
})
