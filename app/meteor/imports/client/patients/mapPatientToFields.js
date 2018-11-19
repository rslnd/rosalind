import fromPairs from 'lodash/fromPairs'
import { dateToDay } from '../../util/time/day'

export const mapPatientToFields = (patient) => {
  let contacts = patient && patient.contacts || [];
  ['Phone', 'Email'].map(channel => {
    if (!contacts.find(c => c.channel === channel)) {
      contacts.push({ channel })
    }
  })

  if (!patient) {
    patient = {}
  }

  const agreements = fromPairs((patient.agreements || []).map(a => (
    [a.to, !!a.agreedAt]
  )))

  return ({
    patientId: patient._id || patient.patientId,
    insuranceId: patient.insuranceId,
    gender: patient.gender || 'Female',
    firstName: patient.firstName,
    lastName: patient.lastName,
    titlePrepend: patient.titlePrepend,
    titleAppend: patient.titleAppend,
    birthday: patient.birthday,
    contacts,
    address: patient.address,
    banned: patient.banned || false,
    externalRevenue: patient.externalRevenue,
    note: patient.note,
    reminders: !patient.noSMS,
    agreements,
    patientSince: patient.patientSince ? dateToDay(patient.patientSince) : undefined
  })
}
