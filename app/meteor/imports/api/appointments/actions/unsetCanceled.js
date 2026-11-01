import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { removeBookablesOverlapping } from '../methods/bookableConflicts'

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

      const appointment = await Appointments.findOneAsync({ _id: appointmentId })
      if (!appointment.canceled) {
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

      // The appointment takes its slot again: drop bookables created there meanwhile
      if (Meteor.isServer) {
        await removeBookablesOverlapping({
          Appointments,
          calendarId: appointment.calendarId,
          assigneeId: appointment.assigneeId,
          start: appointment.start,
          end: appointment.end,
          removedBy: this.userId,
          note: 'Gelöscht, weil Termin wiederhergestellt wurde. Termin: ' + appointmentId
        })
      }

      Events.post('appointments/unsetCanceled', { appointmentId })

      return appointmentId
    }
  })
}
