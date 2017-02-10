import moment from 'moment-timezone'
import { parse as csvToJson } from 'papaparse'
import { dateToDay } from 'util/time/day'

export const parseAction = (action) => {
  switch (action) {
    case 'I': return 'insert'
    case 'U': return 'update'
    case 'D': return 'softRemove'
    default: throw new Error('Action must be one of: I, U, D')
  }
}

export const parseGender = (gender) => {
  if (gender && gender === 'Frau') { return 'Female' }
  if (gender && gender === 'Herr') { return 'Male' }
}

export const parseContacts = ({ phone, email, mobile }) => {
  let contacts = []
  if (phone) { contacts.push({ channel: 'Phone', value: phone }) }
  if (email) { contacts.push({ channel: 'Email', value: email }) }
  if (mobile) { contacts.push({ channel: 'Phone', value: mobile }) }
  return contacts
}

export const parseExternal = ({ id, note, timestamp, action }) => {
  let eoswin = {}
  eoswin.id = id
  eoswin.note = note
  eoswin.timestamps = {}

  switch (action) {
    case 'insert':
      eoswin.timestamps.externalCreatedAt = timestamp
      break
    case 'update':
      eoswin.timestamps.externalUpdatedAt = timestamp
      break
    case 'softRemove':
      eoswin.removed = true
      eoswin.timestamps.removedAt = timestamp
      break
    default:
      throw new Error(`Unkown external action: ${action}`)
  }

  eoswin.timestamps.importedAt = new Date()

  return { eoswin }
}

export const parsePatient = (row, timezone) => {
  const expectedFieldsCount = 17
  if (row.length < 2) { return }
  if (row.length !== expectedFieldsCount) {
    throw new Error(`Expected row to have ${expectedFieldsCount} fields, got ${row.length}: ${row}`)
  }

  const action = parseAction(row[12])

  const patient = {
    insuranceId: row[7],
    external: parseExternal({
      id: row[11],
      timestamp: moment.tz(row[15], 'DD.MM.YYYY H:m:s', timezone).toDate(),
      action,
      note: row[10] }),
    profile: {
      firstName: row[0],
      lastName: row[1],
      titlePrepend: row[2],
      gender: parseGender(row[3]),
      birthday: row[14] && dateToDay(moment.tz(row[14], 'DD.MM.YYYY', timezone)),
      address: {
        line1: row[4],
        postalCode: row[5],
        locality: row[6]
      },
      contacts: parseContacts({ phone: row[8], email: row[9], mobile: row[13] })
    }
  }

  return { patient, action }
}

export const parsePatients = (csv, timezone = 'Europe/Vienna') => {
  const data = csvToJson(csv, {
    delimiter: '|'
  }).data
  const patients = data.map((p) => parsePatient(p, timezone)).filter((p) => p)
  return patients
}
