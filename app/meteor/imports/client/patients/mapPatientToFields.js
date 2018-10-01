import find from 'lodash/fp/find'
import { dateToDay } from '../../util/time/day'

export const mapPatientToFields = (patient) => {
  let contacts = patient && patient.contacts || [];
  ['Phone', 'Email'].map(channel => {
    if (!find(c => c.channel === channel)(contacts)) {
      contacts.push({ channel })
    }
  })

  if (!patient) {
    patient = {}
  }

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
    agreedAt: !!patient.agreedAt,
    patientSince: patient.patientSince ? dateToDay(patient.patientSince) : undefined
  })
}
