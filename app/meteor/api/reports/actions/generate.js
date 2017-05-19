import moment from 'moment-timezone'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { dayToDate } from 'util/time/day'
import { generate as generateReport } from '../methods/generate'

export const generate = ({ Reports, Appointments, Schedules, Tags, Messages }) => {
  return new ValidatedMethod({
    name: 'reports/generate',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      day: { type: Object, blackbox: true },
      addendum: { type: [Object], blackbox: true, optional: true }
    }).validator(),

    run ({ day, addendum }) {
      if (this.isSimulation) { return }

      const date = moment(dayToDate(day))

      const appointments = Appointments.find({
        start: {
          $gt: date.startOf('day').toDate(),
          $lt: date.endOf('day').toDate()
        }
      }).fetch()

      const overrideSchedules = Schedules.find({
        type: 'override',
        start: {
          $gt: date.startOf('day').toDate(),
          $lt: date.endOf('day').toDate()
        }
      }).fetch()

      const appointmentIds = appointments.map(a => a._id)
      const messages = Messages.find({
        'payload.appointmentId': { $in: appointmentIds }
      }).fetch()

      const tagMapping = Tags.methods.getMappingForReports()

      console.log('[Reports] generate: Generating report for day', day, {
        appointments: appointments.length,
        overrideSchedules: overrideSchedules.length
      })

      const report = generateReport({ day, appointments, overrideSchedules, tagMapping, messages, addendum })

      console.log('[Reports] generate: Generated report', JSON.stringify(report, null, 2))

      return Reports.actions.upsert.callPromise({ report })
    }
  })
}
