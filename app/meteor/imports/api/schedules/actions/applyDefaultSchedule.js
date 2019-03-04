import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'
import { transformDefaultsToOverrides } from '../methods/transformDefaultsToOverrides'
import { rangeToDays, isSame, daySelector } from '../../../util/time/day'

export const applyDefaultSchedule = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/applyDefaultSchedule',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      assigneeId: { type: SimpleSchema.RegEx.Id, optional: true },
      from: { type: Date },
      to: { type: Date }
    }).validator(),

    run ({ calendarId, assigneeId, from, to }) {
      if ((this.connection && !this.userId) ||
        !Roles.userIsInRole(this.userId, ['admin', 'schedules-edit'])) {
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

      // Remove all overrides in selected period
      const oldOverridesSelector = {
        type: 'override',
        calendarId,
        start: {
          $gte: moment(from).startOf('day').toDate()
        },
        end: {
          $lte: moment(to).endOf('day').toDate()
        }
      }

      if (assigneeId) {
        oldOverridesSelector.userId = assigneeId
      }

      const countRemovedOverrides = Schedules.remove(oldOverridesSelector)
      console.log('[Schedules] applyDefaultSchedule: Removed', countRemovedOverrides, 'override schedules')

      // Remove all day schedules in selected period
      if (assigneeId) {
        console.log('[Schedules] applyDefaultSchedule: Warning: Skipping removing day schedules')
      } else {
        const countRemovedDays = Schedules.remove({
          type: 'day',
          calendarId,
          $or: days.map(daySelector)
        })
        console.log('[Schedules] applyDefaultSchedule: Removed', countRemovedDays, 'day schedules')
      }

      // Create new overrides from schedules
      const defaultSchedules = Schedules.find({
        type: 'default',
        calendarId
      }).fetch()

      const overrideSchedules = transformDefaultsToOverrides({ defaultSchedules, days })

      // NB: Applying schedules for a single assignee only has an effect if the
      // same assignee is already present in the day schedule
      const ids = overrideSchedules.filter(s =>
        assigneeId
          ? s.type === 'override' && s.userId === assigneeId
          : true
      ).map(s => {
        const id = Schedules.insert(s)
        console.log('Inserted', id, s)
      })

      console.log('[Schedules] applyDefaultSchedule: Inserted', ids.length, 'override and day schedules from', defaultSchedules.length, 'default schedules')

      Events.post('schedules/applyDefaultSchedule', {
        calendarId,
        from,
        to,
        userId: this.userId
      })

      return true
    }
  })
}
