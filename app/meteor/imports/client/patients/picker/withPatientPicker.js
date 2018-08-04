import { connect } from 'react-redux'
import { compose, mapProps } from 'recompose'
import { mapPatientToFields } from '../mapPatientToFields'

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

const toDefaultValue = (props) => {
  if (!props.patientPicker) {
    return props
  }

  const { patient, ...otherState } = props.patientPicker

  const patientFields = mapPatientToFields(patient)

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

export const withPatientInitialValues = compose(
  withPatientPicker,
  mapProps(toDefaultValue)
)
