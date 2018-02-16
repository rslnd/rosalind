import moment from 'moment-timezone'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { dayToDate } from '../../../util/time/day'
import { getQuarterSelector, getRange } from '../../../util/time/quarter'
import { mapQuarter, sumQuarters } from '../methods/mapQuarter'

export const generateQuarter = ({ Reports, Calendars, Schedules }) => {
  return new ValidatedMethod({
    name: 'reports/generateQuarter',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      day: { type: Object, blackbox: true }
    }).validator(),

    run ({ day }) {
      try {
        if (this.isSimulation) { return }

        const date = moment(dayToDate(day))
        const quarter = getRange(date)
        const calendars = Calendars.find({}).fetch()

        const withCalendars = calendars.map(calendar => {
          const calendarId = calendar._id
          const overrideSchedules = Schedules.find({
            type: 'override',
            calendarId,
            start: {
              $gt: quarter.start.toDate(),
              $lt: quarter.end.toDate()
            }
          }).fetch()

          const holidays = Schedules.find({
            type: 'holidays',
            start: {
              $gt: quarter.start.toDate(),
              $lt: quarter.end.toDate()
            }
          })

          const reports = Reports.find({
            ...getQuarterSelector(date),
            calendarId
          }).fetch()

          return {
            calendarId,
            ...mapQuarter({ reports, day, overrideSchedules, holidays })
          }
        })

        const quartersWithTotal = {
          calendars: withCalendars,
          total: sumQuarters(withCalendars)
        }

        console.log('**')
        console.log(withCalendars[0].patients)
        console.log('---')
        console.log('>>>', quartersWithTotal)
        console.log('**')
        return quartersWithTotal
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
