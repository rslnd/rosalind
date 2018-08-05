import map from 'lodash/map'
import { mapPatientToFields } from '../mapPatientToFields'
import { autofill, touch } from 'redux-form'

export const PATIENT_CHANGE_INPUT_VALUE = 'PATIENT_CHANGE_INPUT_VALUE'
export const PATIENT_CHANGE_VALUE = 'PATIENT_CHANGE_VALUE'

export const changeInputValue = (inputValue, fieldAction) => ({
  type: PATIENT_CHANGE_INPUT_VALUE,
  inputValue,
  fieldAction
})

export const changeValue = (patient, fieldAction, ownProps) => {
  return dispatch => {
    dispatch({
      type: PATIENT_CHANGE_VALUE,
      patient,
      fieldAction
    })

    // Autofill form fields when patient is selected, and the
    // picker is part of a form.
    // Setting initialValues would overwrite other form sections,
    // eg. tag is lost when patient changes
    if (ownProps.formName) {
      const fields = mapPatientToFields(patient)
      map(fields, (value, field) =>
        dispatch(autofill(ownProps.formName, `patient.${field}`, value))
      )

      // Reveal validation errors
      dispatch(touchPatientFields(ownProps.formName))
    }
  }
}

export const touchPatientFields = (formName) => {
  // Note: need to touch patient.contacts[0] and [1] separately
  const changedFields = [
    ...Object.keys(mapPatientToFields()).map(k => `patient.${k}`),
    'patient.contacts[0].value',
    'patient.contacts[1].value'
  ]
  return touch(formName, ...changedFields)
}
