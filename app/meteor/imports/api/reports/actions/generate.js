import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { dayToDate, daySelector, dateToDay } from '../../../util/time/day'
import { action, Match } from '../../../util/meteor/action'
import { generate as generateReport } from '../methods/generate'
import { pastAppointmentsSelector } from '../methods/mapPlannedNew'


export const generate = ({ Events, Calendars, Reports, Appointments, Schedules, Tags, Messages, Users }) => {
  return action({
    name: 'reports/generate',
    args: {
      day: Object,
      addendum: Match.Optional(Object)
    },
    allowAnonymous: true,
    async fn ({ day, addendum }) {
      try {
        if (this.isSimulation) { return }
        if (Meteor.isServer) {
          const { isTrustedNetwork } = require('../../customer/isTrustedNetwork')
          if (!this.userId && (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
            throw new Meteor.Error(403, 'Not authorized')
          }
        }

        const date = moment(dayToDate(day))

        const exemptWorkloadAssigneeIds = (await Users.find({
          hiddenInReports: true
        }).fetchAsync()).map(u => u._id)

        const calendars = await Calendars.find({}, { sort: { order: 1 } }).fetchAsync()
        return await Promise.all(calendars.map(async calendar => {
          const calendarId = calendar._id

          let appointments = await Appointments.find({
            calendarId,
            start: {
              $gt: date.startOf('day').toDate(),
              $lt: date.endOf('day').toDate()
            }
          }).fetchAsync()

          if (appointments.length === 0) {
            return null
          }

          const pastAppointments = await Appointments.find(pastAppointmentsSelector({
            date,
            calendarId,
            appointments
          })).fetchAsync()

          const overrideSchedules = await Schedules.find({
            calendarId,
            type: 'override',
            start: {
              $gt: date.startOf('day').toDate(),
              $lt: date.endOf('day').toDate()
            }
          }).fetchAsync()

          const daySchedule = await Schedules.findOneAsync({
            calendarId,
            type: 'day',
            removed: { $ne: true },
            ...daySelector(day)
          })

          const appointmentIds = appointments.map(a => a._id)
          const messages = await Messages.find({
            'payload.appointmentId': { $in: appointmentIds }
          }).fetchAsync()

          const tagMapping = await Tags.methods.getMappingForReports()

          const existingReport = await Reports.findOneAsync({
            calendarId,
            ...daySelector(day)
          })

          let filteredAddendum = null
          if (addendum && (calendar.reportAddenda || []).includes(addendum.type)) {
            filteredAddendum = addendum
          }

          const generatedReport = generateReport({ calendar, day, appointments, pastAppointments, daySchedule, overrideSchedules, tagMapping, messages, existingReport, exemptWorkloadAssigneeIds, addendum: filteredAddendum })

          if (generatedReport.assignees.length === 0) {
            return null
          }

          if (existingReport) {
            Events.post('reports/update', { reportId: existingReport._id })
            return await Reports.updateAsync({ _id: existingReport._id }, generatedReport, { bypassCollection2: true })
          } else {
            const reportId = await Reports.insertAsync(generatedReport)
            Events.post('reports/insert', { reportId })
            return reportId
          }
        }))
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
