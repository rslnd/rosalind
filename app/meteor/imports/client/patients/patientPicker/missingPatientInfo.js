import find from 'lodash/fp/find'

const hasContact = channel => patient =>
  patient.profile.contacts &&
    find(c => c.channel === channel)(patient.profile.contacts)

export const isValid = errors => Object.keys(errors).length === 0

export const missingPatientInfo = (patient) => {
  console.log(patient)
  let errors = {}

  if (!patient.profile.birthday) {
    errors.birthday = 'birthday'
  }

  if (!hasContact('Phone')(patient)) {
    errors.phone = 'phone'
  }

  if (!hasContact('Email')(patient)) {
    errors.email = 'email'
  }

  return errors
}
