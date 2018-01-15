import dot from 'mongo-dot-notation'
import idx from 'idx'
import omitBy from 'lodash/fp/omitBy'
import isEqual from 'lodash/isEqual'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { normalizeName } from '../util/normalizeName'
import { zerofix } from '../../../util/zerofix'

const isEmpty = v => (
  v === null ||
  v === undefined ||
  v === '' ||
  isEqual(v, []) ||
  isEqual(v, {}) ||
  typeof v === 'function'
)

const cleanFields = (p = {}) => {
  if (p.profile && p.profile.contacts === []) {
    delete p.profile.contacts
  }

  return omitBy(isEmpty)(p)
}

export const upsert = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/upsert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      patient: { type: Object, blackbox: true },
      replaceContacts: { type: Boolean, optional: true },
      quiet: { type: Boolean, optional: true }
    }).validator(),

    run ({ patient, quiet, replaceContacts }) {
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
        if (patient._id === 'newPatient') {
          throw new Meteor.Error('Invalid patientId `newPatient`')
        }
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
        if (!replaceContacts && existingPatient.profile && existingPatient.profile.contacts && patient.profile && patient.profile.contacts) {
          let newContacts = []

          patient.profile.contacts.forEach((c) => {
            if (!existingPatient.profile.contacts.map((c) => zerofix(c.value)).includes(zerofix(c.value))) {
              if (c.channel === 'Phone') {
                c.value = zerofix(c.value)
              }
              newContacts.push(c)
            }
          })

          patient.profile.contacts = [ ...existingPatient.profile.contacts, ...newContacts ]
        }

        patient.profile = omitBy(isEmpty)(patient.profile)
        const tempBirthday = patient.profile.birthday
        patient.profile = omitBy((v, k) => k === 'birthday')(patient.profile)

        let update = dot.flatten(patient)
        if (update['$set']) {
          update['$set']['profile.birthday'] = tempBirthday
          if (!replaceContacts && update['$set']['profile.contacts'] === []) {
            delete update['$set']['profile.contacts']
          }
          delete update['$set']._id
          update['$set'] = omitBy(isEmpty)(update['$set'])
        }

        update = cleanFields(update)

        if (!isEqual(update, {}) && !isEqual(update['$set'], {})) {
          console.log('[Patients] Updating', existingPatient._id, JSON.stringify(update, null, 2))

          Patients.update({ _id: existingPatient._id }, update, (err) => {
            if (err) { throw err }
            if (!quiet) { Events.post('patients/update', { patientId: existingPatient._id }) }
          })
        }

        return existingPatient
      } else {
        patient = cleanFields(patient)

        try {
          const patientId = Patients.insert(patient, (e) => {
            if (e) { console.error('[Patients] Insert failed with error', e, 'of patient', patient) }
            if (!quiet) { Events.post('patients/insert', { patientId }) }
          })
          return { _id: patientId, ...patient }
        } catch (e) {
          console.error('[Patients] Insert failed with error', e, 'of patient', patient)
        }
      }
    }
  })
}
