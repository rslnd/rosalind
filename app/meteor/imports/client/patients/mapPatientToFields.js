import find from 'lodash/fp/find'

export const mapPatientToFields = patient => {
  if (patient && patient.profile) {
    let address = {}
    if (patient.profile.address) {
      address = {
        addressLine1: patient.profile.address.line1,
        addressLine2: patient.profile.address.line2,
        addressPostalCode: patient.profile.address.postalCode,
        addressLocality: patient.profile.address.locality,
        addressCountry: patient.profile.address.country
      }
    }

    let contacts = patient.profile.contacts || [];
    ['Phone', 'Email'].map(channel => {
      if (!find(c => c.channel === channel)(contacts)) {
        contacts.push({ channel })
      }
    })

    return ({
      patientId: patient._id,
      insuranceId: patient.insuranceId,
      gender: patient.profile.gender,
      firstName: patient.profile.firstName,
      lastName: patient.profile.lastName,
      titlePrepend: patient.profile.titlePrepend,
      titleAppend: patient.profile.titleAppend,
      birthday: patient.profile.birthday,
      contacts,
      ...address,
      banned: patient.profile.banned,
      externalRevenue: patient.externalRevenue,
      note: patient.note,
      patientSince: patient.patientSince
    })
  } else {
    return null
  }
}
