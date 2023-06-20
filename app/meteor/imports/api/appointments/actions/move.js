import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Messages } from '../../messages'
import { Calendars } from '../../calendars'
import { getDefaultDuration } from '../methods/getDefaultDuration'
import { Schedules } from '../../schedules'
import { daySelector, dateToDay } from '../../../util/time/day'
import { hasRole } from '../../../util/meteor/hasRole'

export const move = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/move',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id },
      newAssigneeId: { type: SimpleSchema.RegEx.Id, optional: true },
      newStart: { type: Date },
      newEnd: { type: Date }
    }).validator(),

    run ({ appointmentId, newStart, newEnd, newAssigneeId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const userId = this.userId

      if (this.isSimulation) {
        return
      }

      const appointment = Appointments.findOne({ _id: appointmentId })

      if (!appointment) {
        throw new Meteor.Error(404, 'Appointment not found')
      }

      const calendar = Calendars.findOne({ _id: appointment.calendarId })

      const allowMoveBetweenAssignees =
        hasRole(Meteor.userId(), ['allowMoveBetweenAssignees']) ||
        calendar.allowMoveBetweenAssignees

      if (!allowMoveBetweenAssignees) {
        const daySchedule = Schedules.findOne({
          type: 'day',
          calendarId: appointment.calendarId,
          ...daySelector(dateToDay(newStart))
        })

        if (!daySchedule || daySchedule.userIds === []) {
          throw new Meteor.Error('assigneeNotScheduled', 'No day schedule found for target date')
        }

        if (newAssigneeId && !daySchedule.userIds.includes(newAssigneeId)) {
          throw new Meteor.Error('assigneeNotScheduled', 'Assignee is not scheduled on target date')
        }
      }

      const duration = getDefaultDuration({
        calendarId: appointment.calendarId,
        assigneeId: newAssigneeId,
        date: moment(newStart),
        tags: appointment.tags
      })
      const oldStart = appointment.start
      const oldEnd = appointment.end
      const oldAssigneeId = appointment.assigneeId

      // usually passed from frontend to fit slots
      newEnd = duration
        ? moment(newStart).add(duration, 'minutes').toDate()
        : newEnd

      Appointments.update({ _id: appointmentId }, {
        $set: {
          start: newStart,
          end: newEnd,
          assigneeId: newAssigneeId
        },
        $push: {
          logs: {
            type: 'move',
            userId: this.userId,
            date: new Date(),
            payload: {
              oldStart,
              oldAssigneeId,
              newStart,
              newAssigneeId
            }
          }
        }
      })

      if (Meteor.isServer) {
        Messages.actions.removeReminder.call({ appointmentId })
      }

      Events.post('appointments/move', {
        appointmentId,
        oldStart,
        oldAssigneeId,
        newStart,
        newAssigneeId
      })

      if (Meteor.isServer) {
        // delete bookables at new location
        Appointments.find({
          type: 'bookable',
          start: { $gte: newStart, $lt: newEnd },
          end: { $gt: newStart, $lte: newEnd },
          calendarId: appointment.calendarId,
          assigneeId: newAssigneeId
        }, { removed: true }).map(a => {
          Appointments.update({_id: a._id}, { $set: {
            removed: true,
            removedAt: new Date(),
            removedBy: userId,
            note: 'Gelöscht, weil ein Termin hier hin verschoben wurde ' + appointmentId + ' \n' + (a.note || '')
          }})
        })

        // restore previous bookables
        // ensure bookables do not get created over overrides
        Appointments.find({
          type: 'bookable',
          start: { $gte: oldStart, $lt: oldEnd },
          end: { $gt: oldStart, $lte: oldEnd },
          calendarId: appointment.calendarId,
          assigneeId: oldAssigneeId,
          removed: true
        }, { removed: true }).fetch().map(a => {
          // was a new override created behind the appt?
          const block = Schedules.findOne({
            type: 'override',
            calendarId: appointment.calendarId,
            userId: oldAssigneeId,
            start: { $lte: oldStart },
            end: { $gte: oldEnd }
          })

          // avoid double bookables being restored after moving appts around the same spot multiple times
          const currentBookable = Appointments.findOne({
            type: 'bookable',
            start: a.start,
            end: a.end,
            calendarId: a.calendarId,
            assigneeId: a.assigneeId
          })

          if (!block && !currentBookable) {
            Appointments.insert({
              type: 'bookable',
              start: a.start,
              end: a.end,
              calendarId: a.calendarId,
              assigneeId: a.assigneeId,
              createdBy: userId,
              note: 'Wieder online freigegeben, weil Termin von hier weg verschoben wurde. Frühere Freigabe: ' + a._id + ' Termin: ' + appointmentId + ' ' + JSON.stringify({
                oldStart,
                oldAssigneeId,
                newStart,
                newAssigneeId
              })
            })
          }
        })
      }

      return appointmentId
    }
  })
}
