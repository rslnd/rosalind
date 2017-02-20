/* eslint-env mocha */
import { expect } from 'chai'
import moment from 'moment'
import { isQuietTime } from './isQuietTime'

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
  })
})
