import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'
import { HM } from '../../../util/schema'
import { dateToDay } from '../../../util/time/day'
import { hasRole } from '../../../util/meteor/hasRole'

// Creates or updates a vacation (per assignee). Stored as its own schedule type
// ('vacation') so that applyDefaultSchedule never removes or reopens it.
export const upsertVacation = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/upsertVacation',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      scheduleId: { type: SimpleSchema.RegEx.Id, optional: true },
      calendarId: { type: SimpleSchema.RegEx.Id },
      userId: { type: SimpleSchema.RegEx.Id },
      start: { type: Date },
      end: { type: Date },
      allDay: { type: Boolean },
      from: { type: HM, optional: true },
      to: { type: HM, optional: true },
      reason: { type: String, optional: true, allowedValues: ['vacation', 'compensatory', 'sick'] }
    }).validator(),

    run ({ scheduleId, calendarId, userId, start, end, allDay, from, to, reason }) {
      if ((this.connection && !this.userId) ||
        !hasRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (end < start) {
        throw new Meteor.Error(400, 'Swap to and from dates')
      }

      if (!allDay && (!from || !to)) {
        throw new Meteor.Error(400, 'from and to times are required unless allDay')
      }

      // Normalize the date range to whole-day boundaries; the actual clipping of
      // partial-day vacations happens via from/to (HM) at apply time.
      const normalizedStart = moment(start).startOf('day').toDate()
      const normalizedEnd = moment(end).endOf('day').toDate()

      const doc = {
        type: 'vacation',
        reason: reason || 'vacation',
        calendarId,
        userId,
        start: normalizedStart,
        end: normalizedEnd,
        allDay,
        available: false
      }

      // Single-day vacations also carry a `day` for cheap day-level selection.
      if (moment(normalizedStart).isSame(normalizedEnd, 'day')) {
        doc.day = dateToDay(normalizedStart)
      }

      if (!allDay) {
        doc.from = from
        doc.to = to
      }

      if (scheduleId) {
        const existing = Schedules.findOne({ type: 'vacation', _id: scheduleId })
        if (!existing) {
          throw new Meteor.Error(404, 'Vacation not found')
        }

        const modifier = { $set: doc }
        if (allDay) {
          modifier.$unset = { from: 1, to: 1 }
        }

        Schedules.update({ _id: scheduleId }, modifier)
        Events.post('schedules/updateVacation', { scheduleId, userId: this.userId })
        return scheduleId
      }

      const newId = Schedules.insert({
        ...doc,
        createdAt: new Date(),
        createdBy: this.userId
      })

      Events.post('schedules/insertVacation', { scheduleId: newId, userId: this.userId })
      return newId
    }
  })
}
