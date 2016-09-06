import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const upsert = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/upsert',

    validate: new SimpleSchema({
      patient: { type: Object, blackbox: true }
    }).validator(),

    run ({ patient }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      // TODO: Split into separate method
      let existingPatient = null
      if (patient.insuranceId) { existingPatient = Patients.findOne({ insuranceId: patient.insuranceId }) }
      if (!existingPatient && patient.external.eoswin.id) { existingPatient = Patients.findOne({ 'external.eoswin.id': patient.external.eoswin.id }) }

      if (existingPatient) {
        Patients.update({ _id: existingPatient._id }, { $set: patient })
        Events.post('patients/upsert', { patientId: existingPatient._id })
        return existingPatient._id
      } else {
        try {
          const patientId = Patients.insert(patient, (err) => {
            if (err) { throw err }
            Events.post('patients/insert', { patientId })
          })
          return patientId
        } catch (e) {
          console.error('[Patients] Insert failed with error', e, 'of patient', patient)
        }
      }
    }
  })
}
