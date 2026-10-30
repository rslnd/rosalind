import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { Messages } from '../../messages'
import { Calendars } from '../../calendars'
import { getDefaultDuration } from '../methods/getDefaultDuration'
import { ceilToSlot } from '../methods/ceilToSlot'
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

    async run ({ appointmentId, newStart, newEnd, newAssigneeId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const userId = this.userId

      if (this.isSimulation) {
        return
      }

      const appointment = await Appointments.findOneAsync({ _id: appointmentId })

      if (!appointment) {
        throw new Meteor.Error(404, 'Appointment not found')
      }

      const calendar = await Calendars.findOneAsync({ _id: appointment.calendarId })

      const allowMoveBetweenAssignees =
        await hasRole(Meteor.userId(), ['allowMoveBetweenAssignees']) ||
        calendar.allowMoveBetweenAssignees

      if (!allowMoveBetweenAssignees) {
        const daySchedule = await Schedules.findOneAsync({
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

      const duration = await getDefaultDuration({
        calendarId: appointment.calendarId,
        assigneeId: newAssigneeId,
        date: moment(newStart),
        tags: appointment.tags
      })
      const oldStart = appointment.start
      const oldEnd = appointment.end
      const oldAssigneeId = appointment.assigneeId

      // usually passed from frontend to fit slots
      // snap to the next grid line, otherwise eg. a 5 min appt moved to 8:00
      // ends at 8:05, which does not exist when slots are at :00, :10, ...
      newEnd = duration
        ? ceilToSlot({ calendar, date: moment(newStart).add(duration, 'minutes') }).toDate()
        : newEnd

      await Appointments.updateAsync({ _id: appointmentId }, {
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
        // Remove the stale reminder (old date/time) and rebuild one for the
        // new start. Recreation can't be left to the periodic createReminders
        // job: it only scans appointments exactly `daysBefore` business days
        // out, so moving to a nearer date would otherwise drop the reminder.
        await Messages.actions.removeReminder.callPromise({ appointmentId })
        await Messages.actions.createReminderForAppointment.callPromise({ appointmentId })
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
        await Appointments.find({
          type: 'bookable',
          start: { $gte: newStart, $lt: newEnd },
          end: { $gt: newStart, $lte: newEnd },
          calendarId: appointment.calendarId,
          assigneeId: newAssigneeId
        }, { removed: true }).mapAsync(async a => {
          await Appointments.updateAsync({_id: a._id}, { $set: {
            removed: true,
            removedAt: new Date(),
            removedBy: userId,
            note: 'Gelöscht, weil ein Termin hier hin verschoben wurde ' + appointmentId + ' \n' + (a.note || '')
          }})
        })

        // restore previous bookables
        // ensure bookables do not get created over overrides
        ;await Promise.all((await Appointments.find({
          type: 'bookable',
          start: { $gte: oldStart, $lt: oldEnd },
          end: { $gt: oldStart, $lte: oldEnd },
          calendarId: appointment.calendarId,
          assigneeId: oldAssigneeId,
          removed: true
        }, { removed: true }).fetchAsync()).map(async a => {
          // was a new override created behind the appt?
          const block = await Schedules.findOneAsync({
            type: 'override',
            calendarId: appointment.calendarId,
            userId: oldAssigneeId,
            start: { $lte: oldStart },
            end: { $gte: oldEnd }
          })

          // avoid double bookables being restored after moving appts around the same spot multiple times
          const currentBookable = await Appointments.findOneAsync({
            type: 'bookable',
            start: a.start,
            end: a.end,
            calendarId: a.calendarId,
            assigneeId: a.assigneeId
          })

          if (!block && !currentBookable) {
            await Appointments.insertAsync({
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
        }))
      }

      return appointmentId
    }
  })
}
