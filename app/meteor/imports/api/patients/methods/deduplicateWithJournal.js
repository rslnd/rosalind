import moment from 'moment'
import idx from 'idx'
import leftPad from 'left-pad'
import find from 'lodash/fp/find'
import flatten from 'lodash/flatten'
import negate from 'lodash/negate'
import identity from 'lodash/identity'
import sortBy from 'lodash/fp/sortBy'
import omitBy from 'lodash/fp/omitBy'
import isNil from 'lodash/isNil'
import isEmpty from 'lodash/isEmpty'
import uniq from 'lodash/uniq'
import { parseCsv, parseDayFromRows } from '../../reports/methods/external/eoswin/journal/processJournal'
import { dayToDate } from '../../../util/time/day'
import { zerofix } from '../../../util/zerofix'

export const deduplicateWithJournal = ({ Appointments, Patients, journal }) => {
  const journalRows = parseCsv(journal)
  const day = parseDayFromRows(journalRows)
  const dayPatients = findPatientsOfDay({ Appointments, Patients, day })
  const duplicates = findDuplicatePatients({ Appointments, Patients, patientsToCheck: dayPatients })
  const sortedDuplicates = sortDuplicates({ duplicates, journalRows })
  const actions = deduplicate(sortedDuplicates)
  const result = perform({ Appointments, Patients, actions })

  console.log(sortedDuplicates, result)
}

const findIdForPatient = journalRows => patient => {
  const dd = leftPad(patient.profile.birthday.day, 2, '0')
  const mm = leftPad(patient.profile.birthday.month, 2, '0')
  const yyyy = patient.profile.birthday.year
  const needle1 = `Patient: ${patient.fullNameNormalized}`
  const needle2 = `geb. am: ${dd}.${mm}.${yyyy}`

  const result = find(r =>
    r.Text.indexOf(needle1) &&
    r.Text.indexOf(needle2)
  )(journalRows)

  if (result) {
    return result.PatId
  }
}

const findPatientsOfDay = ({ Appointments, Patients, day }) => {
  const startOfDay = moment(dayToDate(day)).startOf('day').toDate()
  const endOfDay = moment(dayToDate(day)).endOf('day').toDate()

  const appointments = Appointments.find({
    start: {
      $gt: startOfDay,
      $lt: endOfDay
    },
    removed: { $ne: true },
    patientId: { $ne: null }
  }).fetch()

  const patients = Patients.find({
    _id: {
      $in: appointments.map(a => a.patientId)
    },
    removed: { $ne: true },
    'profile.birthday.day': { $ne: null }
  }).fetch()

  return patients
}

const findDuplicatePatients = ({ Appointments, Patients, patientsToCheck }) => {
  const sameBirthday = Patients.find({
    _id: {
      $nin: patientsToCheck.map(p => p._id)
    },
    $or: patientsToCheck.map(p => ({
      'profile.birthday.day': p.profile.birthday.day,
      'profile.birthday.month': p.profile.birthday.month,
      'profile.birthday.year': p.profile.birthday.year
    })),
    removed: { $ne: true }
  }).fetch()

  const sort = sortBy('fullNameNormalized')
  const fullNameNormalized = sort(sameBirthday.map(p => ({
    ...p,
    fullNameNormalized: `${p.profile.lastName} ${p.profile.firstName}`.toUpperCase()
  })))

  const fullNameNormalizedToCheck = sort(patientsToCheck.map(p => ({
    ...p,
    fullNameNormalized: `${p.profile.lastName} ${p.profile.firstName}`.toUpperCase()
  })))

  const duplicates = fullNameNormalizedToCheck.map(check => ([
    check,
    ...fullNameNormalized.filter(f =>
      f.fullNameNormalized === check.fullNameNormalized &&
      f.profile.birthday.day === check.profile.birthday.day &&
      f.profile.birthday.month === check.profile.birthday.month &&
      f.profile.birthday.year === check.profile.birthday.year
    )
  ])).filter(a => a.length > 1)

  const checkedDuplicates = duplicates.filter(sanityCheckDuplicates)

  return checkedDuplicates
}

const sortDuplicates = ({ duplicates, journalRows }) => {
  const findId = findIdForPatient(journalRows)

  return duplicates.map(tuples => {
    // if exactly one of the duplicates has an eoswin id, it becomes the master
    const isExternal = t => idx(t, _ => _.external.eoswin.id)
    if (tuples.map(isExternal).filter(identity).length === 1) {
      const master = tuples.find(isExternal)
      return [ master, ...tuples.filter(negate(isExternal)) ]
    }

    // if there's no external id in the db yet, attempt to parse it from the journal
    if (uniq(tuples.map(findId)).filter(identity).length === 1) {
      const master = tuples.find(findId)

      return [
        {
          ...master,
          external: {
            eoswin: {
              id: findId(master)
            }
          }
        },
        ...tuples.filter(negate(findId))
      ]
    }

    // else we don't merge
    return null
  }).filter(identity)
}

const mergePatient = (master, addendum) => {
  const { fullNameNormalized, ...masterFields } = master

  return omitBy(isNil)({
    ...masterFields,
    note: mergeNote(master.note, addendum.note),
    profile: omitBy(isNil)({
      ...master.profile,
      contacts: mergeContacts(
        idx(master, _ => _.profile.contacts),
        idx(addendum, _ => _.profile.contacts)
      )
    })
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
  console.log('mergeContacts', typeof master, master, typeof addendum, addendum)

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

const deduplicate = duplicates =>
  duplicates.map(tuple => {
    const master = tuple[0]
    const rest = tuple.slice(1)

    return {
      master: rest.reduce(mergePatient, master),
      duplicateIds: rest.map(r => r._id)
    }
  })

const perform = ({ Appointments, Patients, actions }) =>
  actions.map(a => {
    const masterId = a.master._id
    console.log('[Patients] deduplicateWithJournal: Merging', masterId, ' <- ', a.duplicateIds)
    Patients.update({ _id: masterId }, { $set: a.master })
    const updatedPatients = Patients.update({ _id: { $in: a.duplicateIds } }, { $set: {
      removed: true,
      removedAt: new Date()
    }}, { multi: true })

    const appointments = Appointments.find({ patientId: { $in: a.duplicateIds } }).fetch()
    console.log('[Patients] deduplicateWithJournal: Reassigning', masterId, ' <- ', appointments.length, 'appointments')

    const updatedAppointments = Appointments.update({ _id: { $in: appointments.map(a => a._id) } }, { $set: {
      patientId: masterId
    }}, { multi: true })

    return { masterId, updatedPatients, updatedAppointments }
  })

const sanityCheckDuplicates = duplicates => {
  // fail if any of the potential duplicates have different eoswin ids
  if (uniq(duplicates.map(a => idx(a, _ => _.external.eoswin.id)).filter(identity)).length > 1) { return false }

  return true
}
