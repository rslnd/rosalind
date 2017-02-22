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

      const okay = moment.parseZone('2017-02-24T14:35:00.000+01:00')

      const tooEarly = moment.parseZone('2017-02-24T07:35:00.000+01:00')
      const clampedEarly = moment.parseZone('2017-02-24T09:35:00.000+01:00').toDate()

      const tooLate = moment.parseZone('2017-02-24T18:55:00.000+01:00')
      const clampedLate = moment.parseZone('2017-02-24T15:55:00.000+01:00').toDate()

      it('return original reference when unchanged', () => {
        expect(clampTime(okay, bounds).toDate()).to.equalTime(okay.toDate())
      })

      it('clamps lower bound', () => {
        const result = clampTime(tooEarly.clone(), bounds).toDate()
        expect(result).to.equalTime(clampedEarly)
      })

      it('clamps to upper bound', () => {
        const result = clampTime(tooLate.clone(), bounds).toDate()
        expect(result).to.equalTime(clampedLate)
      })
    })
  })
})
