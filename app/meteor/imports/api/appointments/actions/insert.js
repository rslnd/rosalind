import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Comments } from '../../comments'
import { hasRole } from '../../../util/meteor/hasRole'

export const insert = ({ Appointments }) => {
  return new ValidatedMethod({
    name: 'appointments/insert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointment: { type: Object, blackbox: true },
      newPatient: { type: Object, optional: true, blackbox: true }
    }).validator(),

    run ({ appointment, newPatient }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      this.unblock()

      let patientId = appointment.patientId

      if (newPatient) {
        patientId = Meteor.call('patients/upsert', { patient: newPatient })
      }

      let appointmentId = null

      const { note, ...restFields } = appointment

      if (note && (!appointment.patientId || note === 'PAUSE' || note === 'Verlängerung')) {
        restFields.note = note
      }

      appointmentId = Appointments.insert({ ...restFields, patientId }, (err, appointmentId) => {
        if (err) {
          console.error('[Appointments] Appointment insert failed with error', err)
        } else {
          if (note) {
            Comments.actions.post.callPromise({ docId: appointmentId, body: note })
          }
          Events.post('appointments/insert', { appointmentId })
        }
      })

      return appointmentId
    }
  })
}
