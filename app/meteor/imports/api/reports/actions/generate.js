import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { dayToDate, daySelector } from '../../../util/time/day'
import { action, Match } from '../../../util/meteor/action'
import { generate as generateReport } from '../methods/generate'
import { pastAppointmentsSelector } from '../methods/mapPlannedNew'

export const generate = ({ Events, Calendars, Reports, Appointments, Schedules, Tags, Messages }) => {
  return action({
    name: 'reports/generate',
    args: {
      day: Object,
      addendum: Match.Optional(Object)
    },
    allowAnonymous: true,
    requireClientKey: true,
    fn ({ day, addendum }) {
      try {
        if (this.isSimulation) { return }
        if (Meteor.isServer) {
          const { isTrustedNetwork } = require('../../customer/isTrustedNetwork')
          if (!this.userId && (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
            throw new Meteor.Error(403, 'Not authorized')
          }
        }

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

          if (appointments.length === 0) {
            return null
          }

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

          const daySchedule = Schedules.findOne({
            calendarId,
            type: 'day',
            removed: { $ne: true },
            ...daySelector(day)
          })

          const appointmentIds = appointments.map(a => a._id)
          const messages = Messages.find({
            'payload.appointmentId': { $in: appointmentIds }
          }).fetch()

          const tagMapping = Tags.methods.getMappingForReports()

          const existingReport = Reports.findOne({
            calendarId,
            ...daySelector(day)
          })

          let filteredAddendum = null
          if (addendum && (calendar.reportAddenda || []).includes(addendum.type)) {
            filteredAddendum = addendum
          }

          const generatedReport = generateReport({ calendar, day, appointments, pastAppointments, daySchedule, overrideSchedules, tagMapping, messages, existingReport, addendum: filteredAddendum })

          if (generatedReport.assignees.length === 0) {
            return null
          }

          if (existingReport) {
            Events.post('reports/update', { reportId: existingReport._id })
            return Reports.update({ _id: existingReport._id }, generatedReport, { bypassCollection2: true })
          } else {
            const reportId = Reports.insert(generatedReport)
            Events.post('reports/insert', { reportId })
            return reportId
          }
        })
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
