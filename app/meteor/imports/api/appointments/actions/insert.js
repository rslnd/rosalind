import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Patients } from '../../patients'

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
      appointmentId = Appointments.insert({ ...appointment, patientId }, (err) => {
        if (err) {
          console.error('[Appointments] Appointment insert failed with error', err)
        } else {
          Events.post('appointments/insert', { appointmentId })
        }
      })

      return appointmentId
    }
  })
}
