import moment from 'moment-timezone'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
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

    async run ({ day }) {
      try {
        if (this.isSimulation) { return }

        const date = moment(dayToDate(day))
        const quarter = getRange(date)
        const calendars = await Calendars.find({}).fetchAsync()

        const withCalendars = await Promise.all(calendars.map(async calendar => {
          const calendarId = calendar._id
          const overrideSchedules = await Schedules.find({
            type: 'override',
            calendarId,
            start: {
              $gt: quarter.start.toDate(),
              $lt: quarter.end.toDate()
            }
          }).fetchAsync()

          const holidays = await Schedules.find({
            type: 'holiday',
            start: {
              $gt: quarter.start.toDate(),
              $lt: quarter.end.toDate()
            }
          }).fetchAsync()

          const reports = await Reports.find({
            ...getQuarterSelector(date),
            calendarId
          }).fetchAsync()

          return {
            calendarId,
            ...mapQuarter({ reports, day, overrideSchedules, holidays })
          }
        }))

        const quartersWithTotal = {
          calendars: withCalendars,
          total: sumQuarters(withCalendars)
        }

        return quartersWithTotal
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
