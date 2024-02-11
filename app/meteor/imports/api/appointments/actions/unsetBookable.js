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

      const userId = this.userId

      let selector = {
        _id: bookableId,
        type: 'bookable'
      }

      const locks = Appointments.find(selector).fetch().map((lock) => {
        if (lock.type !== 'bookable') {
          throw new Error('Refusing to remove anything but bookables')
        }
        // hard remove used to be okay here, only soft remove when an appt is created on top
        // since 2023-06-20 always softremove

        Appointments.update({
          _id: lock._id
        }, {
          $set: {
            removed: true,
            removedBy: userId,
            removedAt: new Date(),
            note: 'Manuell gelöscht durch Klick' + '\n' + (lock.note || '')
          }
        })
        return lock._id
      })

      if (locks.length === 1) {
        Events.post('appointments/unsetBookable', { appointmentId: locks[0] })
        return locks[0]
      } else if (locks.length > 1) {
        Events.post('appointments/unsetBookable', { appointmentIds: locks })
        return locks
      }

    }
  })
