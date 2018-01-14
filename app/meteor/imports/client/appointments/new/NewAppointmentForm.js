import { connect } from 'react-redux'
import { reduxForm, formValueSelector } from 'redux-form'
import { TAPi18n } from 'meteor/tap:i18n'
import { validate } from './newAppointmentValidators'
import { NewAppointmentFields } from './NewAppointmentFields'
import { fields as patientFields } from '../../patients/fields'
import { mapStateToProps as mapPatientStateToProps } from '../../patients/mapStateToProps'

export const translateObject = (obj) => {
  let translated = {}
  Object.keys(obj).map((key) => {
    translated[key] = TAPi18n.__(obj[key])
  })
  return translated
}

const formName = 'newAppointment'

let NewAppointmentForm = reduxForm({
  form: formName,
  enableReinitialize: true,
  updateUnregisteredFields: true,
  keepDirtyOnReinitialize: true,
  pure: false,
  fields: [
    'tags',
    'appointmentNote',
    'revenue',
    ...patientFields
  ],
  validate: (values) => translateObject(validate(values))
})(NewAppointmentFields)

const selector = formValueSelector(formName)
NewAppointmentForm = connect(mapPatientStateToProps(selector))(NewAppointmentForm)

export { NewAppointmentForm }
