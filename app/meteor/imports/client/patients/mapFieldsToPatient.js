import { dayToDate } from '../../util/time/day'

export const mapFieldsToPatient = v => {
  let patientId = v.patientId
  let patient = null

  if (patientId) {
    if (patientId === 'newPatient') {
      patientId = undefined
    }

    const contacts = (v.contacts || []).filter(c => c.value)

    patient = {
      _id: patientId,
      insuranceId: v.insuranceId,
      note: v.note,
      externalRevenue: v.externalRevenue,
      patientSince: v.patientSince ? dayToDate(v.patientSince) : undefined,
      gender: v.gender,
      lastName: v.lastName,
      firstName: v.firstName,
      titlePrepend: v.titlePrepend,
      titleAppend: v.titleAppend,
      birthday: v.birthday,
      banned: v.banned,
      address: v.address,
      noSMS: !v.reminders,
      contacts
    }
  }

  return patient
}
