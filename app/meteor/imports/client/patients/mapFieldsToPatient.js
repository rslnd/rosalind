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
      note: v.patientNote,
      externalRevenue: v.externalRevenue,
      patientSince: v.patientSince ? dayToDate(v.patientSince) : undefined,
      profile: {
        gender: v.gender,
        lastName: v.lastName,
        firstName: v.firstName,
        titlePrepend: v.titlePrepend,
        titleAppend: v.titleAppend,
        birthday: v.birthday,
        banned: v.banned,
        note: v.patientNote,
        address: v.address,
        contacts
      }
    }
  }

  return patient
}
