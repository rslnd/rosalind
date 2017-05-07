import moment from 'moment-timezone'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { dayToDate } from 'util/time/day'
import { Schedules } from 'api/schedules'
import { generate as generateReport } from '../methods/generate'

export const generate = ({ Reports, Appointments, Schedules }) => {
  return new ValidatedMethod({
    name: 'reports/generate',

    validate: new SimpleSchema({
      day: { type: Object, blackbox: true }
    }).validator(),

    run ({ day }) {
      const date = moment(dayToDate(day))

      const appointments = Appointments.find({
        start: { $gt: date.startOf('day') },
        end: { $lt: date.endOf('day') }
      }).fetch()

      return generateReport({ day, appointments })
    }
  })
}
