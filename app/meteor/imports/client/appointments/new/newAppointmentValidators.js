import unidecode from 'unidecode'

export const validateNameCase = (name) => {
  if (name && name.length >= 4) {
    const withoutDiacritics = unidecode(name)
    return !!(
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
  let errors = {}

  if (values.patientId === 'newPatient') {
    if (!values.lastName) {
      errors.lastName = 'patients.lastNameRequired'
    }

    if (!values.firstName) {
      errors.firstName = 'patients.firstNameRequired'
    }

    if (values.birthday && !validateDay(values.birthday)) {
      errors.birthday = 'patients.birthdayRequired'
    }

    if (!values.telephone) {
      errors.telephone = 'patients.telephoneRequired'
    }

    if (values.email && !values.email.match(/@/)) {
      errors.email = 'patients.emailIncorrect'
    }

    if (!validateNameCase(values.lastName)) {
      errors.lastName = 'patients.nameCaseWarning'
    }

    if (!validateNameCase(values.firstName)) {
      errors.firstName = 'patients.nameCaseWarning'
    }
  }


  if (values.patientId) {
    if (!values.tags || values.tags.length === 0) {
      errors.tags = 'appointments.tagsRequired'
    }
  }

  return errors
}
