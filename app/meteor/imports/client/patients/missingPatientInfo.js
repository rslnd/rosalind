import find from 'lodash/fp/find'

const hasContact = channel => patient =>
  patient.contacts &&
    find(c => c.channel === channel)(patient.contacts)

export const isEmpty = errors => Object.keys(errors).length === 0

export const missingPatientInfo = (patient) => {
  let errors = {}
  if (!patient) { return {} }

  if (!patient.birthday) {
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
