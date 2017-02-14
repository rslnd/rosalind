/* eslint-env mocha */
import { expect } from 'chai'
import moment from 'moment'
import { isQuietTime } from './isQuietTime'

describe('api', () => {
  describe('messages', () => {
    describe('isQuietTime', () => {
      it('true at night', () => {
        expect(isQuietTime(moment().hour(3))).to.equal(true)
      })

      it('false during the day', () => {
        expect(isQuietTime(moment().hour(12))).to.equal(false)
      })
    })
  })
})
