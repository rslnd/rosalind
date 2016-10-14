import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'
import { normalizeName } from '../util/normalizeName'

export const upsert = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/upsert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patient: { type: Object, blackbox: true },
      quiet: { type: Boolean, optional: true }
    }).validator(),

    // FIXME: Clients can quietly upsert patients
    // this flag is set when bulk importing patients
    run ({ patient, quiet }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (patient.profile && patient.profile.lastName) {
        patient.profile.lastNameNormalized = normalizeName(patient.profile.lastName)
      }

      // TODO: Split into separate method
      let existingPatient = null
      if (patient.insuranceId) { existingPatient = Patients.findOne({ insuranceId: patient.insuranceId }) }
      if (!existingPatient && patient.external && patient.external.eoswin.id) { existingPatient = Patients.findOne({ 'external.eoswin.id': patient.external.eoswin.id }) }

      if (existingPatient) {
        // FIXME: CRITICAL: Don't $set-override any contacts that only exist in this system
        // TODO: Factor contacts into own model
        Patients.update({ _id: existingPatient._id }, { $set: patient })

        if (!quiet) { Events.post('patients/upsert', { patientId: existingPatient._id }) }
        return existingPatient._id
      } else {
        try {
          const patientId = Patients.insert(patient, (e) => {
            if (e) { console.error('[Patients] Insert failed with error', e, 'of patient', patient) }
            if (!quiet) { Events.post('patients/insert', { patientId }) }
          })
          return patientId
        } catch (e) {
          console.error('[Patients] Insert failed with error', e, 'of patient', patient)
        }
      }
    }
  })
}
