import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { action } from '../../../util/meteor/action'

export const unsetBookable = ({ Appointments }) =>
  action({
    name: 'apppointments/unsetBookable',
    args: {
      bookableId: String,
    },
    roles: ['bookables-edit'],
    fn: function ({ bookableId }) {
      this.unblock()

      let selector = {
        _id: bookableId,
        type: 'bookable'
      }

      const locks = Appointments.find(selector).fetch().map((lock) => {
        if (lock.type !== 'bookable') {
          throw new Error('Refusing to remove anything but bookables')
        }
        Appointments.remove({ _id: lock._id })
        return lock._id
      })

      if (locks.length === 1) {
        Events.post('appointments/unsetBookable', { appointmentId: locks[0] })
        return locks[0]
      } else if (locks.length > 1) {
        Events.post('appointments/unsetBookable', { appointmentIds: locks })
        return locks
      }

      return appointmentId
    }
  })
