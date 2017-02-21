/* eslint-env mocha */
import chai from 'chai'
import chaiDatetime from 'chai-datetime'
import moment from 'moment'
import { skipBackwards, skipForwards } from './skipBackwards'

chai.use(chaiDatetime)
const expect = chai.expect

describe('api', () => {
  describe('messages', () => {
    describe('skipBackwards', () => {
      context('counts backwards two working days', () => {
        it('counts continuous weekdays', () => {
          const fri = moment('2017-02-23T10:15:00').toDate()
          const wed = moment('2017-02-21T10:15:00').toDate()
          const daysBefore = 2

          const reminder = skipBackwards(fri, daysBefore).toDate()
          expect(reminder).to.equalDate(wed)
        })

        it('skips weekends by default', () => {
          const mon = moment('2017-02-20T10:15:00').toDate()
          const thuBefore = moment('2017-02-16T10:15:00').toDate()
          const daysBefore = 2

          const reminder = skipBackwards(mon, daysBefore).toDate()
          expect(reminder).to.equalDate(thuBefore)
        })

        it('skips whole month', () => {
          const mon = moment('2017-02-20T10:15:00').toDate()
          const lastJanuary = moment('2017-01-30T10:15:00').toDate()
          const skipDay = (d) => d.month() === 1
          const daysBefore = 2

          const reminder = skipBackwards(mon, daysBefore, skipDay).toDate()
          expect(reminder).to.equalDate(lastJanuary)
        })

        it('skips whole month and weekends', () => {
          const mon = moment('2017-02-20T10:15:00').toDate()
          const lastJanuaryBeforeWeekend = moment('2017-01-27T10:15:00').toDate()
          const skipDay = (d) => (d.month() === 1 || d.isoWeekday() === 6 || d.isoWeekday() === 7)
          const daysBefore = 3

          const reminder = skipBackwards(mon, daysBefore, skipDay).toDate()
          expect(reminder).to.equalDate(lastJanuaryBeforeWeekend)
        })

        it('skip in forward direction', () => {
          const lastJanuaryBeforeWeekend = moment('2017-01-27T10:15:00').toDate()
          const firstMarch = moment('2017-03-01T10:15:00').toDate()
          const skipDay = (d) => (d.month() === 1 || d.isoWeekday() === 6 || d.isoWeekday() === 7)
          const daysBefore = 3

          const reminder = skipForwards(lastJanuaryBeforeWeekend, daysBefore, skipDay).toDate()
          expect(reminder).to.equalDate(firstMarch)
        })
      })
    })
  })
})
