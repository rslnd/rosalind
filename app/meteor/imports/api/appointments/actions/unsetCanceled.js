import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'

export const unsetCanceled = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/unsetCanceled',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run ({ appointmentId }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!(await Appointments.findOneAsync({ _id: appointmentId })).canceled) {
        console.warn('[Appointments] unsetCanceled: Appointment is already not canceled', { appointmentId })
        return
      }

      await Appointments.updateAsync({ _id: appointmentId }, {
        $unset: {
          canceled: null,
          canceledAt: null,
          canceledBy: null
        }
      })

      Events.post('appointments/unsetCanceled', { appointmentId })

      return appointmentId
    }
  })
}
