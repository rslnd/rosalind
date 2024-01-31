import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { dayToDate, daySelector, dateToDay } from '../../../util/time/day'
import { action, Match } from '../../../util/meteor/action'
import { generate as generateReport } from '../methods/generate'
import { pastAppointmentsSelector } from '../methods/mapPlannedNew'
import uniq from 'lodash/uniq'
import sortBy from 'lodash/fp/sortBy'


export const generate = ({ Events, Calendars, Reports, Appointments, Schedules, Tags, Messages, Users }) => {
  return action({
    name: 'reports/generate',
    args: {
      day: Object,
      addendum: Match.Optional(Object)
    },
    allowAnonymous: true,
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

        const exemptWorkloadAssigneeIds = Users.find({
          hiddenInReports: true
        }).fetch().map(u => u._id)

        const calendars = Calendars.find({}, { sort: { order: 1 } }).fetch()
        return calendars.map(calendar => {
          const calendarId = calendar._id

          let appointments = Appointments.find({
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

          // hzw: ignore noon telemed (add fake override if no override overlaps noon)
          // + ignore appts
          if (process.env.CUSTOMER_PREFIX === 'hzw') {
            const userIds = uniq(overrideSchedules.map(s => s.userId))

            userIds.map(uid => {
              const usersOverrides =sortBy('start', overrideSchedules.filter(s => s.userId === uid))

              // is there an override spanning noon?
              const noonBlocked = usersOverrides.find(o => (
                moment(date).clone().hour(13).minute(13).isBetween(
                  moment(o.start),
                  moment(o.end)
                )
              ))

              if (!noonBlocked) {
                // add fake override
                const fakeStart = moment(date).clone().hour(13).minute(0).startOf('minute').toDate()
                const fakeEnd = moment(date).clone().hour(13).minute(45).startOf('minute').toDate()

                overrideSchedules.push({
                  start: fakeStart,
                  end: fakeEnd,
                  type: 'override',
                  isFake: true,
                  userId: uid,
                  calendarId
                })

                // remove noon telemed appts
                appointments = appointments.filter(a => {
                  if (moment(a.start).isBetween(fakeStart, fakeEnd)) {
                    return false
                  } else {
                    return true
                  }
                })
              }
            })
          }

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

          const generatedReport = generateReport({ calendar, day, appointments, pastAppointments, daySchedule, overrideSchedules, tagMapping, messages, existingReport, exemptWorkloadAssigneeIds, addendum: filteredAddendum })

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
