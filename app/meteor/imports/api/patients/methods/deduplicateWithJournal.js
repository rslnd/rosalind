import idx from 'idx'
import find from 'lodash/fp/find'
import flatten from 'lodash/flatten'
import negate from 'lodash/negate'
import omitBy from 'lodash/fp/omitBy'
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import { zerofix } from '../../../util/zerofix'

const mergePatient = (master, addendum) => {
  const { fullNameNormalized, ...masterFields } = master

  return omitBy(isNil)({
    ...masterFields,
    note: mergeNote(master.note, addendum.note),
    contacts: mergeContacts(
      idx(master, _ => _.contacts),
      idx(addendum, _ => _.contacts)
    )
  })
}

const mergeNote = (master = '', addendum = '') => {
  if (master.indexOf(addendum) > -1 && master.length > 3) {
    return master
  } else {
    const merged = [ master, addendum ].join('\n\n').trim()
    if (merged.length > 3) {
      return merged
    }
  }
}

const normalizePhone = s =>
  zerofix(s.replace(/\D/g, ''))

export const isSameContact = a => b =>
  a.channel === b.channel &&
  (
    a.value === b.value ||
    normalizePhone(a.value) === normalizePhone(b.value)
  )

export const mergeContacts = (master = [], addendum = []) => {
  if (!master) { return addendum }
  if (!addendum) { return master }
  return flatten([
    [ ...master, ...addendum ].reduce((master, addendum) => {
      const acc = master.length ? flatten(master) : [ master ]

      if (find(isSameContact(addendum))(acc)) {
        return flatten([ acc ])
      } else {
        return flatten([ acc, addendum ])
      }
    }, master)
  ]).filter(negate(isEmpty))
}

export const deduplicate = duplicates =>
  duplicates.map(tuple => {
    const master = tuple[0]
    const rest = tuple.slice(1)

    return {
      master: rest.reduce(mergePatient, master),
      duplicateIds: rest.map(r => r._id)
    }
  })

export const perform = ({ actions, Patients, Appointments, InboundCalls, Media, Messages, Referrals, Records }) =>
  actions.map(a => {
    const masterId = a.master._id
    console.log('[Patients] deduplicate: Merging', masterId, ' <- ', a.duplicateIds)

    // Patients
    Patients.update({ _id: masterId }, { $set: {
      ...a.master,
      updatedAt: new Date(),
      updatedBy: null
    }})
    Patients.update({ _id: { $in: a.duplicateIds } }, { $set: {
      removed: true,
      removedAt: new Date()
    } }, { multi: true })

    // helper function
    const forceReassignPatientId = (apiName, Api) => {
      const docs = Api.find({ patientId: { $in: a.duplicateIds } }).fetch()
      console.log('[Patients] deduplicate: Reassigning to master patient id', masterId, ' <- ', docs.length, apiName)

      Api.update({ _id: { $in: docs.map(a => a._id) } }, { $set: {
        patientId: masterId
      } }, { multi: true })

      return { [apiName]: docs.map(a => a._id) }
    }

    const changedIds = {
      patients: a.duplicateIds,
      ...forceReassignPatientId('appointments', Appointments),
      ...forceReassignPatientId('inboundCalls', InboundCalls),
      ...forceReassignPatientId('media', Media),
      ...forceReassignPatientId('messages', Messages),
      ...forceReassignPatientId('referrals', Referrals),
      ...forceReassignPatientId('records', Records)
    }

    const result = { masterId, ...changedIds }

    console.log('[Patients] deduplicate: Done, reassigned to master patient id', masterId, ' <- ', changedIds)

    return result
  })
