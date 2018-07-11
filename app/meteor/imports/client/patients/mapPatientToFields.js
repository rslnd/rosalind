import find from 'lodash/fp/find'
import { dateToDay } from '../../util/time/day'

export const mapPatientToFields = patient => {
  if (patient) {
    let contacts = patient.contacts || [];
    ['Phone', 'Email'].map(channel => {
      if (!find(c => c.channel === channel)(contacts)) {
        contacts.push({ channel })
      }
    })

    return ({
      patientId: patient._id || patient.patientId,
      insuranceId: patient.insuranceId,
      gender: patient.gender,
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
      patientSince: patient.patientSince ? dateToDay(patient.patientSince) : undefined
    })
  } else {
    return null
  }
}
