import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'
import { Patients } from 'api/patients'

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

      console.log('[Appointments] Insert', { appointment, newPatient })

      let patientId = appointment.patientId

      if (newPatient) {
        patientId = Patients.actions.upsert.call({ patient: newPatient })
      }

      const appointmentId = Appointments.insert({ ...appointment, patientId }, (err) => {
        if (err) {
          console.error('[Appointments] Appointment insert failed with error', err, 'of appointment', appointment)
        } else {
          Events.post('appointments/insert', { appointmentId })
        }
      })

      return appointmentId
    }
  })
}
