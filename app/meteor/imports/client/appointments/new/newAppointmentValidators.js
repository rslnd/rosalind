import unidecode from 'unidecode'

export const validateNameCase = (name) => {
  if (name && name.length >= 4) {
    const withoutDiacritics = unidecode(name)
    return !!(
      withoutDiacritics.match(/^[A-Z][a-z]/) ||
      withoutDiacritics.match(/^[A-Z][a-z]/) ||
      withoutDiacritics.match(/\s/) ||
      withoutDiacritics.match(/[a-z][A-Z][a-z]/)
    )
  } else {
    return true
  }
}

export const validateDay = (day) => {
  return (typeof day === 'object' && day.year && day.month && day.day)
}

export const validate = (values) => {
  let errors = {
    patient: {},
    appointment: {}
  }

  console.log('validating', values)

  if (!values.appointment || (
    (
      !values.appointment.tags ||
      values.appointment.tags.length === 0
    ) && !values.appointment.note)
  ) {
    errors.appointment.tags = 'appointments.selectTagOrNote'
    errors.appointment.note = 'appointments.addNoteIfNoTagsSelected'
  }

  if (values.patient) {
    if (!values.patient.lastName) {
      errors.patient.lastName = 'patients.lastNameRequired'
    }

    if (!values.patient.firstName) {
      errors.patient.firstName = 'patients.firstNameRequired'
    }

    if (!values.patient.birthday || values.patient.birthday && !validateDay(values.patient.birthday)) {
      errors.patient.birthday = 'patients.birthdayRequired'
    }
  }

  if (Object.keys(errors.appointment).length === 0) {
    delete errors.appointment
  }

  if (Object.keys(errors.patient).length === 0) {
    delete errors.patient
  }

  console.log(errors)

  return errors
}
