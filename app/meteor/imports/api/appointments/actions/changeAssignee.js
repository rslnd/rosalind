import { startOfDay, endOfDay } from 'date-fns'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Schedules } from '../../schedules'
import { Day } from '../../../util/schema/day'
import { dayToDate } from '../../../util/time/day'

// This action updates the assigneeId of someone's appointments on a given day,
// eg. when the assignee gets ill
export const changeAssignee = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/changeAssignee',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      oldAssigneeId: { type: SimpleSchema.RegEx.Id },
      newAssigneeId: { type: SimpleSchema.RegEx.Id },
      day: { type: Day }
    }).validator(),

    run ({ calendarId, oldAssigneeId, newAssigneeId, day }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Appointments.update({
        start: {
          $gte: startOfDay(dayToDate(day)),
          $lte: endOfDay(dayToDate(day))
        },
        assigneeId: oldAssigneeId,
        calendarId
      }, {
        $set: {
          assigneeId: newAssigneeId
        }
      }, {
        multi: true
      })

      Schedules.update({
        type: 'override',
        start: {
          $gte: startOfDay(dayToDate(day)),
          $lte: endOfDay(dayToDate(day))
        },
        userId: oldAssigneeId,
        calendarId
      }, {
        $set: {
          userId: newAssigneeId
        }
      }, {
        multi: true
      })

      const dayScheduleSelector = {
        type: 'day',
        'day.day': day.day,
        'day.month': day.month,
        'day.year': day.year,
        calendarId
      }

      Schedules.update({
        ...dayScheduleSelector,
        userIds: oldAssigneeId
      }, {
        $pull: {
          userIds: oldAssigneeId
        }
      })
      // Can't push and pull on the same field in one update
      Schedules.update(dayScheduleSelector, {
        $addToSet: {
          userIds: newAssigneeId
        }
      })

      Events.post('appointments/changeAssignee', {
        day,
        oldAssigneeId,
        newAssigneeId,
        calendarId
      })

      return true
    }
  })
}
