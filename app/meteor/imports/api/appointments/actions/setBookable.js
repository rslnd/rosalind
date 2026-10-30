import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
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
    fn: async function ({ calendarId, assigneeId, start, end }) {
      this.unblock()


      const existing = await Appointments.find({
        calendarId,
        start,
        end,
        assigneeId,
        type: 'bookable'
      }).fetchAsync()

      if (existing.length > 0) {
        console.log('setBookable: ignoring duplicate bookable')
        return null
      } else {

        const appointmentId = await Appointments.insertAsync({
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
