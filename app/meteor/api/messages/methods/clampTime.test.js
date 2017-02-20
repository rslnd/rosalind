/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import moment from 'moment-timezone'
import { clampTime } from './clampTime'

chai.use(chaiDatetime)
const expect = chai.expect

describe('api', () => {
  describe('messages', () => {
    describe('clampTime', () => {
      const lower = (m) => m.hour(9).startOf('hour')
      const upper = (m) => m.hour(15).endOf('hour')
      const bounds = { lower, upper }

      const okay = moment().hour(12)
      const tooEarly = moment().hour(7)
      const tooLate = moment().hour(16)

      it('return original reference when unchanged', () => {
        expect(moment(clampTime(okay, bounds)).isSame(okay)).to.equal(true)
      })

      it('clamps to lower bound', () => {
        const lowerBound = lower(tooEarly.clone())
        const lowerClamped = clampTime(tooEarly.clone(), bounds)
        expect(lowerClamped.isSame(lowerBound)).to.equal(true)
      })

      it('clamps to upper bound', () => {
        const upperBound = upper(moment())
        const upperClamped = clampTime(tooLate.clone(), bounds)
        expect(upperClamped.isSame(upperBound.clone())).to.equal(true)
      })

      it('clamps lower with padding', () => {
        const lowerClamped = clampTime(tooEarly.clone(), { ...bounds, pad: 10 })
        const lowerWithPadding = lower(tooEarly.clone()).add(10, 'minutes')
        expect(lowerClamped.toDate()).to.equalTime(lowerWithPadding.toDate())
      })

      it('clamps upper with padding', () => {
        const upperClamped = clampTime(tooLate.clone(), { ...bounds, pad: 10 })
        const upperWithPadding = upper(tooLate.clone()).subtract(10, 'minutes')
        expect(upperClamped.toDate()).to.equalTime(upperWithPadding.toDate())
      })
    })
  })
})
