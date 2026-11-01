import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'
import { Appointments } from '../../appointments'
import { Calendars } from '../../calendars'
import { transformDefaultsToOverrides, applyHM } from '../methods/transformDefaultsToOverrides'
import { createBookableSlots } from '../../appointments/methods/createBookableSlots'
import { rangeToDaysInTz, rangeBounds, dayBounds, isSame, daySelector, dayToDate, dateToDay } from '../../../util/time/day'
import { hasRole } from '../../../util/meteor/hasRole'
import { toWeekday } from '../../../util/time/weekdays'
import { union, without } from 'lodash'
import { invalidDefaultSchedules, describeDefaultSchedule } from '../methods/validateDefaultSchedule'
import { Users } from '../../users'

export const applyDefaultSchedule = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/applyDefaultSchedule',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      assigneeIds: { type: Array, optional: true },
      'assigneeIds.$': { type: SimpleSchema.RegEx.Id },
      from: { type: Date },
      to: { type: Date }
    }).validator(),

    async run ({ calendarId, assigneeIds, from, to }) {
      if ((this.connection && !this.userId) ||
        !await hasRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (to < from) {
        throw new Meteor.Error(400, 'Swap to and from dates')
      }

      // Today may be (re)planned as well, eg. from the day view. Online
      // bookable slots are only ever created for times still in the future.
      const now = new Date()
      if (to <= now || from < moment.tz(now, 'Europe/Vienna').startOf('day').toDate()) {
        throw new Meteor.Error(400, 'Dates must not be in the past')
      }

      if (this.isSimulation) { return }

      // Days and day boundaries of the practice (Vienna); the server runs in UTC,
      // where eg. Vienna midnight of the 3rd is still the 2nd.
      const range = rangeBounds({ from, to })

      // Refuse to apply default schedules that don't line up with the day view
      // grid: they would create blocked times and bookable slots at odd times.
      const calendar = await Calendars.findOneAsync({ _id: calendarId })
      const defaultSchedules = await Schedules.find({
        type: 'default',
        calendarId,
        removed: { $ne: true }
      }).fetchAsync()

      const invalid = invalidDefaultSchedules({
        calendar,
        defaultSchedules: defaultSchedules.filter(d => assigneeIds ? assigneeIds.includes(d.userId) : true)
      })
      if (invalid.length >= 1) {
        const lines = await Promise.all(invalid.map(async ({ schedule, problems }) => {
          const user = await Users.findOneAsync({ _id: schedule.userId })
          const name = user ? Users.methods.fullNameWithTitle(user) : schedule.userId
          return `${name} ${describeDefaultSchedule(schedule)}: ${problems.join(', ')}`
        }))
        throw new Meteor.Error(400, `Wochenplan bitte zuerst korrigieren – ${lines.join('; ')}`)
      }

      const holidays = await Schedules.find({
        type: 'holiday',
        removed: { $ne: true },
        end: { $gte: range.start }
      }).fetchAsync()

      const excludeHolidays = d => !holidays.find(h => isSame(d, h.day))

      const days = rangeToDaysInTz({ from, to }).filter(excludeHolidays)

      // Load vacations overlapping the applied range. Vacations are a separate
      // schedule type, so the override/overlay/day removal below never touches
      // them – bulk apply must not reopen a vacation.
      const vacationSelector = {
        type: 'vacation',
        calendarId,
        removed: { $ne: true },
        start: { $lte: range.end },
        end: { $gte: range.start }
      }
      if (assigneeIds) {
        vacationSelector.userId = { $in: assigneeIds }
      }
      const vacations = await Schedules.find(vacationSelector).fetchAsync()

      // Vacations (allDay / partial) covering a given day for a given user.
      const vacationsFor = (day, userId) => {
        const { start: dayStart, end: dayEnd } = dayBounds(day)
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
          $gte: range.start
        },
        end: {
          $lte: range.end
        }
      }

      if (assigneeIds) {
        oldOverridesSelector.userId = { $in: assigneeIds }
      }

      const countRemovedOverrides = await Schedules.removeAsync(oldOverridesSelector)
      console.log('[Schedules] applyDefaultSchedule: Removed', countRemovedOverrides, 'override schedules')

      // Remove existing bookable slots in the range before recreating them, so
      // re-applying does not accumulate duplicate bookables.
      // Past bookables (earlier today) are kept, they are not recreated either.
      const oldBookablesSelector = {
        type: 'bookable',
        calendarId,
        removed: { $ne: true },
        start: { $gte: new Date(Math.max(range.start.getTime(), now.getTime())) },
        end: { $lte: range.end }
      }
      if (assigneeIds) {
        oldBookablesSelector.assigneeId = { $in: assigneeIds }
      }
      const countRemovedBookables = await Appointments.removeAsync(oldBookablesSelector)
      console.log('[Schedules] applyDefaultSchedule: Removed', countRemovedBookables, 'bookable slots')


      const existingDaySchedules = await Schedules.find({
        type: 'day',
        calendarId,
        $or: days.map(d => daySelector(d)) // force 1-arity to prevent map index from being set as prefix
      }).fetchAsync()

      // Remove (assignees or all) from day schedules in selected period
      if (assigneeIds) {
        // First, remove all to-be-updated assignees from all day schedules. We'll later re-add them and recreate any missing day schedules
        await Promise.all(existingDaySchedules.map(async ds => {
          await Schedules.updateAsync({ _id: ds._id },
            {
              $set: {
                userIds: without(ds.userIds, ...assigneeIds)
              }
            })
        }))
      } else {
        // When applying to all assignees, DO NOT remove all day schedules (would lose day note + noteDetails) but just clear users
        const countRemovedDays = await Schedules.updateAsync({
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
            const { start: ds, end: de } = dayBounds(day)
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
        // Re-fetch: existingDaySchedules still holds the userIds from before the
        // assignees were removed above, so a union with it would put them back.
        const currentDaySchedules = await Schedules.find({
          _id: { $in: existingDaySchedules.map(es => es._id) }
        }).fetchAsync()
        for (const es of currentDaySchedules) {
          for (const os of overrideSchedules.filter(os => os.type === 'day')) {
            if (isSame(es.day, os.day)) {
              console.log('[Schedules] applyDefaultSchedule:' + es._id + ' ' + union(es.userIds, os.userIds).join())
              daysForWhichDaySchedulesAlreadyExist.push(es.day)
              await Schedules.updateAsync({ _id: es._id }, {
                $addToSet: {
                  userIds: { $each: os.userIds.filter(oid => assigneeIds.includes(oid)) }
                }
              })
            }
          }
        }

        // Now, create any day schedules for days that were not accounted for above
        console.log('[Schedules] applyDefaultSchedule: creating day schedules for previously unaccounted days')
        await Promise.all(overrideSchedules.filter(os => os.type === 'day').map(async ds => {
          if (!daysForWhichDaySchedulesAlreadyExist.find(d => isSame(d, ds.day))) {
            console.log('[Schedules] applyDefaultSchedule: insert ' + dayToDate(ds.day), + ' ' + ds.userIds)
            await Schedules.insertAsync({
              ...ds,
              userIds: ds.userIds.filter(oid => assigneeIds.includes(oid))
            })
          }
        }))
      } else {
        console.log('[Schedules] applyDefaultSchedule: re-adding assignees to all day schedules or upserting')
        // Sequential: findOne-then-insert would insert duplicates for the same day
        for (const ds of overrideSchedules.filter(os => os.type === 'day')) {
          const existingDay = await Schedules.findOneAsync({
            type: 'day',
            calendarId,
            ...daySelector(ds.day)
          })

          if (existingDay) {
            await Schedules.updateAsync({ _id: existingDay._id }, {
              $set: {
                userIds: ds.userIds
              }
            })
          } else {
            await Schedules.insertAsync(ds)
          }
        }
      }


      // Add all override schedules
      console.log('[Schedules] applyDefaultSchedule: inserting all override schedules')
      await Promise.all(overrideSchedules
        .filter(os => ((os.type === 'override') || (os.type === 'overlay')))
        .filter(os => assigneeIds ? assigneeIds.includes(os.userId) : true)
        .map(async os => {
          await Schedules.insertAsync(os)
        }))

      console.log('[Schedules] applyDefaultSchedule: Done. Inserted override and day schedules from', defaultSchedules.length, 'default schedules')

      Events.post('schedules/applyDefaultSchedule', {
        calendarId,
        from,
        to,
        assigneeIds,
        userId: this.userId
      })

      // Hacky fix: remove duplicate override schedules
      // Sequential on purpose: the existence check below only prevents
      // duplicates from removing each other when they are processed in order.
      const overridesToDedupe = await Schedules.find({
        start: { $gte: from },
        end: { $lte: to },
        calendarId,
        $or: [
          { type: 'override' },
          { type: 'overlay' }
        ]
      }).fetchAsync()
      for (const os of overridesToDedupe) {
        // avoid removing all schedules, only check for dupes when os wasn't removed already
        if (await Schedules.findOneAsync({_id: os._id })) {
          await Schedules.removeAsync({
            _id: { $ne: os._id },
            start: os.start,
            end: os.end,
            userId: os.userId,
            calendarId: os.calendarId
          })
        }
      }

      // Create bookable slots for default blocks marked "online bookable",
      // skipping days/times covered by a vacation or a pause block.
      const makeBookableSlots = createBookableSlots({ Appointments })
      let totalBookables = 0

      for (const day of days) {
        const wd = toWeekday(dayBounds(day).start)
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

        // Pause / blocking blocks of the default schedule ("Mittag", ...)
        const pauseRanges = userId => defaultSchedules
          .filter(d => d.weekday === wd && d.userId === userId && d.available === false && d.from && d.to)
          .map(d => ({ start: applyHM(day, d.from), end: applyHM(day, d.to) }))

        for (const userId of Object.keys(byUser)) {
          totalBookables += await makeBookableSlots({
            calendar,
            calendarId,
            userId,
            day,
            ranges: byUser[userId],
            blockedRanges: [...partialVacationRanges(day, userId), ...pauseRanges(userId)],
            notBefore: now,
            createdBy: this.userId
          })
        }
      }

      console.log('[Schedules] applyDefaultSchedule: Created', totalBookables, 'bookable slots')

      return true
    }
  })
}
