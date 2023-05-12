import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { action } from '../../../util/meteor/action'

export const setBookable = ({ Appointments }) =>
  action({
    name: 'apppointments/setBookable',
    args: {
      calendarId: String,
      start: Date,
      end: Date,
      assigneeId: String
    },
    roles: ['bookables-edit'],
    fn: function ({ calendarId, assigneeId, start, end }) {
      this.unblock()


      const existing = Appointments.find({
        calendarId,
        start,
        end,
        assigneeId,
        type: 'bookable'
      }).fetch()

      if (existing.length > 0) {
        console.log('setBookable: ignoring duplicate bookable')
        return null
      } else {

        const appointmentId = Appointments.insert({
          calendarId,
          start,
          end,
          assigneeId,
          type: 'bookable',
          createdAt: new Date(),
          createdBy: this.userId
        })

        Events.post('appointments/setBookable', { appointmentId })

        return appointmentId
      }
    }
  })
