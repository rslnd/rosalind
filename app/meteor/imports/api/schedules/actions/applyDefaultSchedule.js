import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'
import { Appointments } from '../../appointments'
import { Calendars } from '../../calendars'
import { transformDefaultsToOverrides, applyHM } from '../methods/transformDefaultsToOverrides'
import { createBookableSlots } from '../../appointments/methods/createBookableSlots'
import { rangeToDays, isSame, daySelector, dayToDate, dateToDay } from '../../../util/time/day'
import { hasRole } from '../../../util/meteor/hasRole'
import { union, without } from 'lodash'

export const applyDefaultSchedule = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/applyDefaultSchedule',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      assigneeIds: { type: [SimpleSchema.RegEx.Id], optional: true },
      from: { type: Date },
      to: { type: Date }
    }).validator(),

    run ({ calendarId, assigneeIds, from, to }) {
      if ((this.connection && !this.userId) ||
        !hasRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (to < from) {
        throw new Meteor.Error(400, 'Swap to and from dates')
      }

      if (to <= new Date() || from <= new Date()) {
        throw new Meteor.Error(400, 'Dates must be in the future')
      }

      if (this.isSimulation) { return }

      const holidays = Schedules.find({
        type: 'holiday',
        start: {
          $gte: new Date()
        }
      }).fetch()

      const excludeHolidays = d => !holidays.find(h => isSame(d, h.day))

      const days = rangeToDays({ from, to }).filter(excludeHolidays)

      // Load vacations overlapping the applied range. Vacations are a separate
      // schedule type, so the override/overlay/day removal below never touches
      // them – bulk apply must not reopen a vacation.
      const vacationSelector = {
        type: 'vacation',
        calendarId,
        removed: { $ne: true },
        start: { $lte: moment(to).endOf('day').toDate() },
        end: { $gte: moment(from).startOf('day').toDate() }
      }
      if (assigneeIds) {
        vacationSelector.userId = { $in: assigneeIds }
      }
      const vacations = Schedules.find(vacationSelector).fetch()

      // Vacations (allDay / partial) covering a given day for a given user.
      const vacationsFor = (day, userId) => {
        const dayStart = moment(dayToDate(day)).startOf('day').toDate()
        const dayEnd = moment(dayToDate(day)).endOf('day').toDate()
        return vacations.filter(v =>
          v.userId === userId &&
          v.start <= dayEnd &&
          v.end >= dayStart
        )
      }
      const hasAllDayVacation = (day, userId) =>
        vacationsFor(day, userId).some(v => v.allDay)
      // Blocked date intervals on a day caused by partial-day vacations.
      const partialVacationRanges = (day, userId) =>
        vacationsFor(day, userId)
          .filter(v => !v.allDay && v.from && v.to)
          .map(v => ({
            start: applyHM(day, v.from),
            end: applyHM(day, v.to)
          }))

      // Remove all overrides in selected period
      const oldOverridesSelector = {
        $or: [
          { type: 'override' },
          { type: 'overlay' },
        ],
        calendarId,
        start: {
          $gte: moment(from).startOf('day').toDate()
        },
        end: {
          $lte: moment(to).endOf('day').toDate()
        }
      }

      if (assigneeIds) {
        oldOverridesSelector.userId = { $in: assigneeIds }
      }

      const countRemovedOverrides = Schedules.remove(oldOverridesSelector)
      console.log('[Schedules] applyDefaultSchedule: Removed', countRemovedOverrides, 'override schedules')

      // Remove existing bookable slots in the range before recreating them, so
      // re-applying does not accumulate duplicate bookables.
      const oldBookablesSelector = {
        type: 'bookable',
        calendarId,
        removed: { $ne: true },
        start: { $gte: moment(from).startOf('day').toDate() },
        end: { $lte: moment(to).endOf('day').toDate() }
      }
      if (assigneeIds) {
        oldBookablesSelector.assigneeId = { $in: assigneeIds }
      }
      const countRemovedBookables = Appointments.remove(oldBookablesSelector)
      console.log('[Schedules] applyDefaultSchedule: Removed', countRemovedBookables, 'bookable slots')


      const existingDaySchedules = Schedules.find({
        type: 'day',
        calendarId,
        $or: days.map(d => daySelector(d)) // force 1-arity to prevent map index from being set as prefix
      })

      // Remove (assignees or all) from day schedules in selected period
      if (assigneeIds) {
        // First, remove all to-be-updated assignees from all day schedules. We'll later re-add them and recreate any missing day schedules
        existingDaySchedules.map(ds => {
          Schedules.update({ _id: ds._id },
            {
              $set: {
                userIds: without(ds.userIds, assigneeIds)
              }
            })
        })
      } else {
        // When applying to all assignees, DO NOT remove all day schedules (would lose day note + noteDetails) but just clear users
        const countRemovedDays = Schedules.update({
          type: 'day',
          calendarId,
          $or: days.map(d => daySelector(d)) // force 1-arity to prevent map index from being set as prefix
        }, {
          $set: {
            userIds: []
          }
        })
        console.log('[Schedules] applyDefaultSchedule: Removed', countRemovedDays, 'day schedules')
      }

      // Create new overrides from schedules
      const defaultSchedules = Schedules.find({
        type: 'default',
        calendarId
      }).fetch()

      const rawOverrideSchedules = transformDefaultsToOverrides({ defaultSchedules, days })

      // Vacation protection:
      // - allDay vacations: drop the user's blocking overrides for that day and
      //   remove them from the day's attendance (they get no column that day).
      // - partial-day vacations: keep the user scheduled but add a blocking
      //   override for the vacation interval.
      const overrideSchedules = rawOverrideSchedules
        .filter(os => {
          if (os.type === 'day') { return true }
          return !hasAllDayVacation(dateToDay(os.start), os.userId)
        })
        .map(os => {
          if (os.type !== 'day') { return os }
          return {
            ...os,
            userIds: os.userIds.filter(uid => !hasAllDayVacation(os.day, uid))
          }
        })

      // Blocking overrides for partial-day vacations.
      vacations
        .filter(v => !v.allDay && v.from && v.to)
        .forEach(v => {
          days.forEach(day => {
            const ds = moment(dayToDate(day)).startOf('day').toDate()
            const de = moment(dayToDate(day)).endOf('day').toDate()
            if (v.start <= de && v.end >= ds) {
              overrideSchedules.push({
                type: 'override',
                available: false,
                calendarId,
                userId: v.userId,
                note: 'Urlaub',
                start: applyHM(day, v.from),
                end: applyHM(day, v.to)
              })
            }
          })
        })


      if (assigneeIds) {
        // Now re-add users to existing day schedules
        console.log('[Schedules] applyDefaultSchedule: Re-adding users to existing day schedules')
        let daysForWhichDaySchedulesAlreadyExist = []
        existingDaySchedules.map(es => {
          overrideSchedules.filter(os => os.type === 'day').map(os => {
            if (isSame(es.day, os.day)) {
              console.log('[Schedules] applyDefaultSchedule:' + es._id + ' ' + union(es.userIds, os.userIds).join())
              daysForWhichDaySchedulesAlreadyExist.push(es.day)
              Schedules.update({ _id: es._id }, {
                $set: {
                  userIds: union(es.userIds, os.userIds.filter(oid => assigneeIds.includes(oid)))
                }
              })
            }
          })
        })

        // Now, create any day schedules for days that were not accounted for above
        console.log('[Schedules] applyDefaultSchedule: creating day schedules for previously unaccounted days')
        overrideSchedules.filter(os => os.type === 'day').map(ds => {
          if (!daysForWhichDaySchedulesAlreadyExist.find(d => isSame(d, ds.day))) {
            console.log('[Schedules] applyDefaultSchedule: insert ' + dayToDate(ds.day), + ' ' + ds.userIds)
            Schedules.insert({
              ...ds,
              userIds: ds.userIds.filter(oid => assigneeIds.includes(oid))
            })
          }
        })
      } else {
        console.log('[Schedules] applyDefaultSchedule: re-adding assignees to all day schedules or upserting')
        overrideSchedules.filter(os => os.type === 'day').map(ds => {
          const existingDay = Schedules.findOne({
            type: 'day',
            calendarId,
            ...daySelector(ds.day)
          })

          if (existingDay) {
            Schedules.update({ _id: existingDay._id }, {
              $set: {
                userIds: ds.userIds
              }
            })
          } else {
            Schedules.insert(ds)
          }
        })
      }


      // Add all override schedules
      console.log('[Schedules] applyDefaultSchedule: inserting all override schedules')
      overrideSchedules
        .filter(os => ((os.type === 'override') || (os.type === 'overlay')))
        .filter(os => assigneeIds ? assigneeIds.includes(os.userId) : true)
        .map(os => {
          Schedules.insert(os)
        })

      console.log('[Schedules] applyDefaultSchedule: Done. Inserted override and day schedules from', defaultSchedules.length, 'default schedules')

      Events.post('schedules/applyDefaultSchedule', {
        calendarId,
        from,
        to,
        assigneeIds,
        userId: this.userId
      })

      // Hacky fix: remove duplicate override schedules
      Schedules.find({
        start: { $gte: from },
        end: { $lte: to },
        calendarId,
        $or: [
          { type: 'override' },
          { type: 'overlay' }
        ]
      }).fetch().map(os => {
        // avoid removing all schedules, only check for dupes when os wasn't removed already
        if (Schedules.findOne({_id: os._id })) {
          Schedules.remove({
            _id: { $ne: os._id },
            start: os.start,
            end: os.end,
            userId: os.userId,
            calendarId: os.calendarId
          })
        }
      })

      // Create bookable slots for default blocks marked "online bookable",
      // skipping days/times covered by a vacation.
      const calendar = Calendars.findOne({ _id: calendarId })
      const makeBookableSlots = createBookableSlots({ Appointments })
      let totalBookables = 0

      days.forEach(day => {
        const wd = moment(dayToDate(day)).locale('en').format('ddd').toLowerCase()
        const bookableDefaults = defaultSchedules.filter(d =>
          d.weekday === wd &&
          d.available !== false &&
          d.bookable === true &&
          d.from && d.to &&
          (assigneeIds ? assigneeIds.includes(d.userId) : true)
        )

        // Group ranges by user so we can honor per-user vacations.
        const byUser = {}
        bookableDefaults.forEach(d => {
          if (hasAllDayVacation(day, d.userId)) { return }
          byUser[d.userId] = byUser[d.userId] || []
          byUser[d.userId].push({ from: d.from, to: d.to })
        })

        Object.keys(byUser).forEach(userId => {
          totalBookables += makeBookableSlots({
            calendar,
            calendarId,
            userId,
            day,
            ranges: byUser[userId],
            blockedRanges: partialVacationRanges(day, userId),
            createdBy: this.userId
          })
        })
      })

      console.log('[Schedules] applyDefaultSchedule: Created', totalBookables, 'bookable slots')

      return true
    }
  })
}
