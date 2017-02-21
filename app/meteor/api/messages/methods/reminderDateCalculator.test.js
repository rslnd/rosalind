/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import moment from 'moment-timezone'
import { reminderDateCalculator } from './reminderDateCalculator'

chai.use(chaiDatetime)
const expect = chai.expect

describe('api', () => {
  describe('messages', () => {
    describe('reminderDateCalculator', () => {
      const holidays = [
        { start: '2017-12-25T00:00:00.000', end: '2017-12-25T23:59:59.999' },
        { start: '2017-12-26T00:00:00.000', end: '2018-01-06T23:59:59.999' }
      ]
      const days = 3
      const { calculateReminderDate, calculateFutureCutoff } = reminderDateCalculator({ holidays, days })

      const now = moment('2017-12-20T19:30:00.000')
      const expectedCutoffDate = moment('2018-01-08T19:30:00.000')
      const appointmentDate = moment('2018-01-08T18:30:15.000')
      const expectedReminderDate = moment('2017-12-20T15:44:59.999')

      it('skips backwards over holidays, weekends, and clamps time', () => {
        expect(calculateReminderDate(appointmentDate).toDate())
          .to.equalTime(expectedReminderDate.toDate())
      })

      it('skips forwards over holidays and weekends', () => {
        expect(calculateFutureCutoff(now).toDate())
          .to.equalTime(expectedCutoffDate.toDate())
      })
    })
  })
})
