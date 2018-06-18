import dot from 'mongo-dot-notation'
import omitBy from 'lodash/fp/omitBy'
import isEqual from 'lodash/isEqual'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { normalizeName } from '../util/normalizeName'
import { zerofix } from '../../../util/zerofix'
import { normalizePhoneNumber } from '../../messages/methods/normalizePhoneNumber'

const isEmpty = (v, k) => {
  if (k === 'note') {
    return false
  } else {
    return (
      v === null ||
      v === undefined ||
      v === '' ||
      isEqual(v, []) ||
      isEqual(v, {}) ||
      typeof v === 'function'
    )
  }
}

const normalizeContact = c => {
  if (c.channel === 'Phone') {
    const valueNormalized = normalizePhoneNumber(c.value)
    const value = c.value.trim()
    return { ...c, valueNormalized, value }
  } else {
    const value = c.value.trim()
    return { ...c, value }
  }
}

const cleanFields = (p = {}) => {
  if (p.contacts === []) {
    delete p.contacts
  }

  if (p.contacts) {
    p.contacts = p.contacts.filter(c => c.value && c.value.trim())
    p.contacts = p.contacts.map(normalizeContact)
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
      try {
        if (this.connection && !this.userId) {
          throw new Meteor.Error(403, 'Not authorized')
        }

        this.unblock()

        if (this.connection) {
          quiet = false
        }

        if (patient.lastName) {
          patient.lastNameNormalized = normalizeName(patient.lastName)
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

        if (!existingPatient && patient.external && patient.external.eoswin && patient.external.eoswin.id) {
          existingPatient = Patients.findOne({ 'external.eoswin.id': patient.external.eoswin.id })
        }

        if (!existingPatient && patient.external && patient.external.bioresonanz && patient.external.bioresonanz.id) {
          existingPatient = Patients.findOne({ 'external.bioresonanz.id': patient.external.bioresonanz.id })
        }

        if (existingPatient) {
          // TODO: Factor contacts into own model
          if (!replaceContacts && existingPatient.contacts && patient.contacts) {
            let newContacts = []

            patient.contacts.forEach((c) => {
              if (!existingPatient.contacts.map((c) => zerofix(c.value)).includes(zerofix(c.value))) {
                if (c.channel === 'Phone') {
                  c.value = zerofix(c.value)
                }
                newContacts.push(c)
              }
            })

            // New contacts go first, because reminders etc go to the first matching channel
            patient.contacts = [ ...newContacts, ...existingPatient.contacts ].filter(c =>
              c.value)
          }

          patient = omitBy(isEmpty)(patient)

          const tempBirthday = patient.birthday
          patient = omitBy((v, k) => k === 'birthday')(patient)

          let update = dot.flatten(cleanFields(patient))
          if (update['$set']) {
            update['$set']['birthday'] = tempBirthday
            if (!replaceContacts && update['$set']['contacts'] === []) {
              delete update['$set']['contacts']
            }
            delete update['$set']._id
            update['$set'] = omitBy(isEmpty)(update['$set'])
          }

          if (update['$set']) {
            update['$set'] = cleanFields(update['$set'])
          }
          update = cleanFields(update)

          if (!isEqual(update, {}) && !isEqual(update['$set'], {})) {
            console.log('[Patients] Updating', existingPatient._id)

            Patients.update({ _id: existingPatient._id }, update, (err) => {
              if (err) {
                console.error('[Patients] upsert: Update failed with error', err)
                throw err
              }
              if (!quiet) { Events.post('patients/update', { patientId: existingPatient._id }) }
            })
          }

          return existingPatient._id
        } else {
          patient = cleanFields(patient)

          try {
            let patientId = null
            patientId = Patients.insert(patient, (e) => {
              if (e) {
                console.error('[Patients] upsert: Insert failed with error', e)
                throw e
              }
              if (!quiet) { Events.post('patients/insert', { patientId }) }
            })
            return patientId
          } catch (e) {
            console.error('[Patients] upsert: Insert failed with error', e)
            throw e
          }
        }
      } catch (e) {
        console.error('[Patients] upsert: failed', e)
        throw e
      }
    }
  })
}
