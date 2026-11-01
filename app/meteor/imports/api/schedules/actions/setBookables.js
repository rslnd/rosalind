import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'
import { Appointments } from '../../appointments'
import { Calendars } from '../../calendars'
import { applyHM } from '../methods/transformDefaultsToOverrides'
import { createBookableSlots } from '../../appointments/methods/createBookableSlots'
import { rangeToDaysInTz, rangeBounds, dayBounds, isSame, daySelector, dayToString } from '../../../util/time/day'
import { toWeekday } from '../../../util/time/weekdays'
import { hasRole } from '../../../util/meteor/hasRole'

// Day boundaries of the day view, same as transformDefaultsToOverrides
const DAY_START = { h: 7, m: 30 }
const DAY_END = { h: 21, m: 0 }

// Opens (bookable: true) or closes (bookable: false) online booking in bulk:
// for whole columns (assigneeIds), whole days or day spans (from–to).
//
// Opening creates bookable slots in all the open time of each scheduled
// assignee, ie. the time of the day view column that is not blocked by an
// override (pause, closed, ...), a vacation or an existing appointment. Days
// marked closed / holidays and assignees on all-day vacation are skipped. When
// a column has no planned times for the day yet, the default schedule of that
// weekday is used as opening times instead; without one the column is skipped.
//
// Existing future bookables in the affected columns are replaced, so opening
// again also repairs bookables that do not line up with the grid.
export const setBookables = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/setBookables',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      assigneeIds: { type: Array, optional: true },
      'assigneeIds.$': { type: SimpleSchema.RegEx.Id },
      from: { type: Date },
      to: { type: Date },
      bookable: { type: Boolean }
    }).validator(),

    async run ({ calendarId, assigneeIds, from, to, bookable }) {
      if ((this.connection && !this.userId) ||
        !await hasRole(this.userId, ['admin', 'schedules-edit', 'bookables-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (to < from) {
        throw new Meteor.Error(400, 'Swap to and from dates')
      }

      const now = new Date()
      if (to <= now) {
        throw new Meteor.Error(400, 'Dates must not be in the past')
      }

      if (this.isSimulation) { return }

      const calendar = await Calendars.findOneAsync({ _id: calendarId })
      if (!calendar) {
        throw new Meteor.Error(404, 'Calendar not found')
      }

      // Days of the practice (Vienna), the server runs in UTC
      const days = rangeToDaysInTz({ from, to })
      const { start: rangeStart, end: rangeEnd } = rangeBounds({ from, to })

      const holidays = await Schedules.find({
        type: 'holiday',
        removed: { $ne: true },
        start: { $lte: rangeEnd },
        end: { $gte: rangeStart }
      }).fetchAsync()

      const daySchedules = await Schedules.find({
        type: 'day',
        calendarId,
        removed: { $ne: true },
        $or: days.map(d => daySelector(d))
      }).fetchAsync()

      const vacations = await Schedules.find({
        type: 'vacation',
        calendarId,
        removed: { $ne: true },
        start: { $lte: rangeEnd },
        end: { $gte: rangeStart }
      }).fetchAsync()

      const defaultSchedules = await Schedules.find({
        type: 'default',
        calendarId,
        removed: { $ne: true }
      }).fetchAsync()

      const makeBookableSlots = createBookableSlots({ Appointments })

      const removeBookables = async ({ dayStart, dayEnd, userIds }) => {
        const selector = {
          type: 'bookable',
          calendarId,
          removed: { $ne: true },
          start: { $gte: new Date(Math.max(dayStart.getTime(), now.getTime())), $lte: dayEnd }
        }
        if (userIds) { selector.assigneeId = { $in: userIds } }
        return Appointments.updateAsync(selector, {
          $set: { removed: true, removedAt: new Date(), removedBy: this.userId }
        }, { multi: true })
      }

      const result = { created: 0, removed: 0, skipped: [] }

      for (const day of days) {
        const { start: dayStart, end: dayEnd } = dayBounds(day)
        if (dayEnd <= now) { continue }

        if (!bookable) {
          result.removed += await removeBookables({ dayStart, dayEnd, userIds: assigneeIds })
          continue
        }

        if (holidays.find(h => h.day ? isSame(h.day, day) : (h.start <= dayEnd && h.end >= dayStart))) {
          result.skipped.push({ day: dayToString(day), reason: 'closed' })
          continue
        }

        const daySchedule = daySchedules.find(ds => isSame(ds.day, day))
        const scheduledIds = (daySchedule && daySchedule.userIds) || []
        const userIds = assigneeIds
          ? assigneeIds.filter(id => scheduledIds.includes(id))
          : scheduledIds

        if (assigneeIds) {
          assigneeIds.filter(id => !scheduledIds.includes(id)).forEach(userId =>
            result.skipped.push({ day: dayToString(day), userId, reason: 'notScheduled' }))
        }

        const weekday = toWeekday(dayStart)

        for (const userId of userIds) {
          const userVacations = vacations.filter(v =>
            v.userId === userId && v.start <= dayEnd && v.end >= dayStart)

          if (userVacations.some(v => v.allDay)) {
            result.skipped.push({ day: dayToString(day), userId, reason: 'vacation' })
            continue
          }

          const blockedRanges = userVacations
            .filter(v => v.from && v.to)
            .map(v => ({ start: applyHM(day, v.from), end: applyHM(day, v.to) }))

          const blockingOverrides = await Schedules.find({
            type: 'override',
            calendarId,
            userId,
            available: false,
            removed: { $ne: true },
            start: { $lt: dayEnd },
            end: { $gt: dayStart }
          }).fetchAsync()

          let ranges
          if (blockingOverrides.length >= 1) {
            // Planned day: everything within the day view not blocked is open.
            ranges = [{ from: DAY_START, to: DAY_END }]
            blockingOverrides.forEach(o => blockedRanges.push({ start: o.start, end: o.end }))
          } else {
            // Column without planned times: fall back to the default schedule
            // of this weekday as opening times.
            const defaults = defaultSchedules.filter(d =>
              d.userId === userId && d.weekday === weekday && d.from && d.to)
            ranges = defaults
              .filter(d => d.available !== false)
              .map(d => ({ from: d.from, to: d.to }))
            defaults
              .filter(d => d.available === false)
              .forEach(d => blockedRanges.push({ start: applyHM(day, d.from), end: applyHM(day, d.to) }))
          }

          if (ranges.length === 0) {
            result.skipped.push({ day: dayToString(day), userId, reason: 'noOpeningTimes' })
            continue
          }

          // Replace (not counted as removed): repairs misaligned bookables.
          await removeBookables({ dayStart, dayEnd, userIds: [userId] })

          result.created += await makeBookableSlots({
            calendar,
            calendarId,
            userId,
            day,
            ranges,
            blockedRanges,
            notBefore: now,
            createdBy: this.userId
          })
        }
      }

      console.log('[Schedules] setBookables:', bookable ? 'opened' : 'closed', result.created, 'created', result.removed, 'removed', result.skipped.length, 'skipped')

      Events.post('schedules/setBookables', {
        calendarId,
        from,
        to,
        assigneeIds,
        bookable,
        created: result.created,
        removed: result.removed,
        userId: this.userId
      })

      return result
    }
  })
}
