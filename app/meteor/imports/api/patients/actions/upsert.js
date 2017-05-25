import dot from 'mongo-dot-notation'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { normalizeName } from '../util/normalizeName'
import { zerofix } from '../../../util/zerofix'

export const upsert = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/upsert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patient: { type: Object, blackbox: true },
      quiet: { type: Boolean, optional: true }
    }).validator(),

    run ({ patient, quiet }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (this.connection) {
        quiet = false
      }

      if (patient.profile && patient.profile.lastName) {
        patient.profile.lastNameNormalized = normalizeName(patient.profile.lastName)
      }

      // TODO: Split into separate method
      let existingPatient = null

      if (patient._id) {
        existingPatient = Patients.findOne({ _id: patient._id })
      }

      if (!existingPatient && patient.insuranceId) {
        existingPatient = Patients.findOne({ insuranceId: patient.insuranceId })
      }

      if (!existingPatient && patient.external && patient.external.eoswin.id) {
        existingPatient = Patients.findOne({ 'external.eoswin.id': patient.external.eoswin.id })
      }

      if (existingPatient) {
        // TODO: Factor contacts into own model
        if (existingPatient.profile && existingPatient.profile.contacts && patient.profile && patient.profile.contacts) {
          let newContacts = []

          patient.profile.contacts.forEach((c) => {
            if (!existingPatient.profile.contacts.map((c) => c.value).includes(c.value)) {
              if (c.channel === 'Phone') {
                c.value = zerofix(c.value)
              }
              newContacts.push(c)
            }
          })

          patient.profile.contacts = [ ...existingPatient.profile.contacts, ...newContacts ]
        }

        console.log('[Patients] Updating', { patient })

        Patients.update({ _id: existingPatient._id }, dot.flatten(patient), (err) => {
          if (err) { throw err }
          if (!quiet) { Events.post('patients/update', { patientId: existingPatient._id }) }
        })

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
