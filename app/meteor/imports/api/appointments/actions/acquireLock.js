import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { getDefaultDuration } from '../methods/getDefaultDuration'

export const acquireLock = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/acquireLock',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      calendarId: { type: SimpleSchema.RegEx.Id },
      time: { type: Date },
      assigneeId: { type: String, optional: true }
    }).validator(),

    run ({ calendarId, assigneeId, time }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const duration = getDefaultDuration({
        calendarId,
        assigneeId,
        date: moment(time)
      })

      const appointmentId = Appointments.insert({
        calendarId,
        start: time,
        end: moment(time).add(duration, 'minutes').toDate(),
        assigneeId,
        lockedAt: new Date(),
        lockedBy: this.userId
      })

      Events.post('appointments/acquireLock', { appointmentId })

      return appointmentId
    }
  })
}
