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
        { start: moment.parseZone('2017-12-25T00:00:00.000+01:00'), end: moment.parseZone('2017-12-25T23:59:59.999+01:00') },
        { start: moment.parseZone('2017-12-26T00:00:00.000+01:00'), end: moment.parseZone('2018-01-06T23:59:59.999+01:00') }
      ]
      const days = 3
      const { calculateReminderDate, calculateFutureCutoff } = reminderDateCalculator({ holidays, days })

      const now = moment.parseZone('2017-12-20T19:30:00.000+01:00')
      const expectedCutoffDate = moment.parseZone('2018-01-08T19:30:00.000+01:00')
      const appointmentDate = moment.parseZone('2018-01-08T18:35:00.000+01:00')
      const expectedReminderDate = moment.parseZone('2017-12-20T15:35:00.000+01:00')

      it('skips backwards over holidays, weekends, and clamps time', () => {
        expect(
          calculateReminderDate(appointmentDate).toDate())
          .to.equalTime(expectedReminderDate.toDate())
      })

      it('skips forwards over holidays and weekends', () => {
        expect(calculateFutureCutoff(now).toDate())
          .to.equalTime(expectedCutoffDate.toDate())
      })

      it('counts weekdays continuously', () => {
        const appointmentDate2 = moment.parseZone('2017-02-24T11:35:00.000+01:00')
        const expectedReminderDate2 = moment.parseZone('2017-02-21T11:35:00.000+01:00')

        expect(
          calculateReminderDate(appointmentDate2).toDate())
          .to.equalTime(expectedReminderDate2.toDate())
      })
    })
  })
})
