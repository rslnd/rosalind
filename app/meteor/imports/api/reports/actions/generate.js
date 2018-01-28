import moment from 'moment-timezone'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { dayToDate } from '../../../util/time/day'
import { generate as generateReport } from '../methods/generate'
import { pastAppointmentsSelector } from '../methods/mapPlannedNew'

export const generate = ({ Calendars, Reports, Appointments, Schedules, Tags, Messages }) => {
  return new ValidatedMethod({
    name: 'reports/generate',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      day: { type: Object, blackbox: true },
      addendum: { type: Object, blackbox: true, optional: true }
    }).validator(),

    run ({ day, addendum }) {
      try {
        if (this.isSimulation) { return }

        const date = moment(dayToDate(day))

        const calendars = Calendars.find({}, { sort: { order: 1 } }).fetch()
        return calendars.map(calendar => {
          const calendarId = calendar._id

          const appointments = Appointments.find({
            calendarId,
            start: {
              $gt: date.startOf('day').toDate(),
              $lt: date.endOf('day').toDate()
            }
          }).fetch()

          const pastAppointments = Appointments.find(pastAppointmentsSelector({
            date,
            calendarId,
            appointments
          })).fetch()

          const overrideSchedules = Schedules.find({
            calendarId,
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

          const existingReport = Reports.findOne({ calendarId, day })

          let filteredAddendum = null
          if (addendum && (calendar.reportAddenda || []).includes(addendum.type)) {
            filteredAddendum = addendum
          }

          const generatedReport = generateReport({ calendar, day, appointments, pastAppointments, overrideSchedules, tagMapping, messages, existingReport, addendum: filteredAddendum })

          if (existingReport) {
            return Reports.update({ _id: existingReport._id }, generatedReport, { bypassCollection2: true })
          } else {
            return Reports.insert(generatedReport)
          }
        })
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
