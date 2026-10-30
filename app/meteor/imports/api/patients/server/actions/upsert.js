import { flatten } from 'mongo-dot-notation'
import idx from 'idx'
import omitBy from 'lodash/fp/omitBy'
import isEqual from 'lodash/isEqual'
import { Meteor } from 'meteor/meteor'
import { Events } from '../../../events'
import { Referrals } from '../../../referrals'
import { normalizeName } from '../../util/normalizeName'
import { zerofix } from '../../../../util/zerofix'
import { daySelector } from '../../../../util/time/day'
import { normalizePhoneNumber } from '../../../messages/methods/normalizePhoneNumber'
import { action, Match } from '../../../../util/meteor/action'
import { Clients } from '../../../clients'

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
  if (c.channel === 'Phone' && c.value) {
    const valueNormalized = normalizePhoneNumber(c.value)
    const value = c.value.trim()
    return { ...c, valueNormalized, value }
  } else if (c.value) {
    const value = c.value.trim()
    return { ...c, value }
  } else {
    return c
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

export const upsert = ({ Patients }) =>
  action({
    name: 'patients/upsert',
    allowAnonymous: true,
    requireClientKey: false,
    args: {
      patient: Object,
      replaceContacts: Match.Maybe(Match.Optional(Boolean)),
      quiet: Match.Maybe(Match.Optional(Boolean)),
      createExternalReferralTo: Match.Maybe(Match.Optional(String))
    },
    async fn ({ patient, quiet, replaceContacts, createExternalReferralTo, clientKey }) {
      try {
        if (Meteor.isServer) {
          const { isTrustedNetwork } = require('../../../customer/isTrustedNetwork')
          if (!this.userId && (this.connection && (!isTrustedNetwork(this.connection.clientAddress) || !(clientKey && !(await Clients.findOneAsync({ clientKey })).isBanned)))) {
            throw new Meteor.Error(403, 'Not authorized')
          }
        }

        this.unblock()

        if (this.connection) {
          quiet = false
        }

        if (patient.lastName) {
          patient.lastNameNormalized = normalizeName(patient.lastName)
        }

        if (patient.firstName) {
          patient.firstNameNormalized = normalizeName(patient.firstName)
        }

        // TODO: Split into separate method
        let existingPatient = null

        if (patient._id) {
          if (patient._id === 'newPatient') {
            throw new Meteor.Error('Invalid patientId `newPatient`')
          }
          existingPatient = await Patients.findOneAsync({ _id: patient._id }, { removed: true })
        }

        if (!existingPatient && patient.insuranceId) {
          existingPatient = await Patients.findOneAsync({ insuranceId: patient.insuranceId }, { removed: true })
        }

        for (const ex of ['eoswin', 'inno', 'bioresonanz']) {
          if (!existingPatient && patient.external && patient.external[ex] && patient.external[ex].id) {
            existingPatient = await Patients.findOneAsync({ [`external.${ex}.id`]: patient.external[ex].id }, { removed: true })
          }
        }

        if (!existingPatient &&
          patient.birthday &&
          patient.birthday.day &&
          patient.birthday.month &&
          patient.birthday.year) {
          const candidates = await Patients.find({
            firstName: patient.firstName,
            lastNameNormalized: patient.lastNameNormalized,
            ...daySelector(patient.birthday, 'birthday')
          }).fetchAsync()
          const potentialExistingPatient = candidates.length === 1 ? candidates[0] : null

          const extIdA = idx(potentialExistingPatient, _ => _.external.eoswin.id)
          const extIdB = idx(patient, _ => _.external.eoswin.id)
          existingPatient = ((extIdA || extIdB) && (extIdA !== extIdB))
            ? potentialExistingPatient
            : null
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
                newContacts.push(normalizeContact(c))
              }
            })

            // New contacts go first, because reminders etc go to the first matching channel
            patient.contacts = [ ...newContacts, ...existingPatient.contacts ].filter(c =>
              c.value)
          }

          patient = omitBy(isEmpty)(patient)

          const tempBirthday = patient.birthday
          patient = omitBy((v, k) => k === 'birthday')(patient)

          const agreements = patient.agreements || []
          delete patient.agreements

          let update = flatten(cleanFields(patient))
          if (!update['$unset']) {
            update['$unset'] = {}
          }

          Object.keys(agreements).map(label => {
            const agreed = agreements[label]
            if (existingPatient.agreements &&
              existingPatient.agreements.find(a => a.to === label) &&
              !agreed) {
              update['$set'].agreements = existingPatient.agreements.filter(a => a.to !== label)
            } else if (
              (existingPatient.agreements &&
                (
                  !existingPatient.agreements.find(a => a.to === label) ||
                  !existingPatient.agreements
                )
              ) &&
              agreed) {
              update['$set'].agreements = [
                ...(existingPatient.agreements || []),
                {
                  to: label,
                  witnessBy: this.userId,
                  agreedAt: new Date()
                }
              ]
            }
          })

          if (Object.keys(update['$unset']).length === 0) {
            delete update.$unset
          }

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

            // trimStrings collection2 flag to prevent killing space-y "layout" of notes
            // Meteor 3's updateAsync never invokes a callback; follow-ups run after the await.
            try {
              await Patients.updateAsync({ _id: existingPatient._id }, update, { trimStrings: false })
            } catch (err) {
              console.error('[Patients] upsert: Update failed with error', err)
              throw err
            }
            if (!quiet) { Events.post('patients/update', { patientId: existingPatient._id }) }

            await ensureExternalReferral({
              patientId: existingPatient._id,
              createExternalReferralTo
            })

            await Patients.updateAsync({ _id: existingPatient._id }, {
              $set: {
                updatedAt: new Date(),
                updatedBy: this.userId
              }
            })
          }

          return existingPatient._id
        } else {
          patient = cleanFields(patient)

          if (patient.agreedAt) {
            patient.agreedAt = new Date()
          } else {
            delete patient.agreedAt
          }

          try {
            // Meteor 3's insertAsync never invokes a callback; follow-ups run after the await.
            const patientId = await Patients.insertAsync(patient)
            if (!quiet) { Events.post('patients/insert', { patientId }) }

            await ensureExternalReferral({
              patientId,
              createExternalReferralTo
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

const ensureExternalReferral = async ({ patientId, createExternalReferralTo }) => {
  try {
    if (createExternalReferralTo) {
      const existingReferral = await Referrals.findOneAsync({
        patientId,
        referredTo: createExternalReferralTo
      })

      if (!existingReferral) {
        const referralId = await Referrals.insertAsync({
          type: 'external',
          patientId,
          referredTo: createExternalReferralTo,
          createdAt: new Date(),
          redeemedAt: new Date()
        })

        console.log('[Patients] upsert: created external referral', {
          patientId,
          referralId
        })

        return referralId
      }

      return existingReferral._id
    }
  } catch (e) {
    console.error('[Patients] upsert: Ignoring failed external referral')
    console.error(e)
  }
}
