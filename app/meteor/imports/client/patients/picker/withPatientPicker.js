import { connect } from 'react-redux'
import { compose, mapProps } from 'recompose'
import { mapPatientToFields } from '../mapPatientToFields'
import { touchPatientFields } from './actions'

const mapStateToProps = state => {
  if (state.patientPicker && state.patientPicker.patient) {
    return {
      patientPicker: state.patientPicker
    }
  } else {
    return {}
  }
}

export const withPatientPicker = connect(mapStateToProps)

const toDefaultValue = formName => props => {
  const { patient, ...otherState } = props.patientPicker || {}

  const patientFields = mapPatientToFields(patient)

  if (patient) {
    const setTouched = patient.patientId !== 'newPatient'
    props.dispatch(touchPatientFields(formName, { setTouched }))
  }

  return {
    ...props,
    // Always provide initialValues (even before a patient is chosen) so the
    // redux-form form is `initialized` right from mount. Otherwise the very
    // first patient selection after a page load is redux-form's *initial*
    // initialize, where keepDirtyOnReinitialize does not apply yet, and tags
    // selected beforehand would be wiped.
    initialValues: {
      ...(props.defaultValue || {}),
      patient: patientFields
    },
    ...otherState
  }
}

export const withPatientInitialValues = formName => compose(
  withPatientPicker,
  mapProps(toDefaultValue(formName))
)
