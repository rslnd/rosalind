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
  if (!props.patientPicker) {
    return props
  }

  const { patient, ...otherState } = props.patientPicker

  const patientFields = mapPatientToFields(patient)

  const setTouched = patient.patientId !== 'newPatient'
  props.dispatch(touchPatientFields(formName, { setTouched }))

  console.log('[withPatient] fields', patientFields)

  return {
    ...props,
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
