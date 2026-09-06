import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'
import { Day } from '../../../util/schema'
import { daySelector } from '../../../util/time/day'
import { hasRole } from '../../../util/meteor/hasRole'

// Marks a single day as practice-wide closed (holiday) or reopens it.
// Mirrors the holiday insert logic in HolidaysContainer.handleSubmit so a day
// closed here also shows up in the general holidays list.
export const setDayClosed = ({ Schedules }) => {
  return new ValidatedMethod({
    name: 'schedules/setDayClosed',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      day: { type: Day },
      closed: { type: Boolean },
      note: { type: String, optional: true }
    }).validator(),

    run ({ day, closed, note }) {
      if ((this.connection && !this.userId) ||
        !hasRole(this.userId, ['admin', 'schedules-edit'])) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const existing = Schedules.find({
        type: 'holiday',
        removed: { $ne: true },
        ...daySelector(day)
      }).fetch()

      if (closed) {
        if (existing.length > 0) {
          return existing[0]._id
        }

        // Build the day boundaries in the clinic timezone so the holiday does
        // not bleed into the neighbouring day when compared in Europe/Vienna.
        const viennaDay = moment.tz({ year: day.year, month: day.month - 1, day: day.day }, 'Europe/Vienna')
        const scheduleId = Schedules.insert({
          type: 'holiday',
          available: false,
          day,
          note: note || 'Geschlossen',
          start: viennaDay.clone().startOf('day').toDate(),
          end: viennaDay.clone().endOf('day').toDate(),
          createdAt: new Date(),
          createdBy: this.userId
        })

        Events.post('schedules/setDayClosed', { scheduleId, userId: this.userId })
        return scheduleId
      } else {
        existing.forEach(h => {
          Schedules.update({ _id: h._id }, {
            $set: { removed: true, removedAt: new Date(), removedBy: this.userId }
          })
        })
        Events.post('schedules/setDayOpen', { userId: this.userId })
        return null
      }
    }
  })
}
