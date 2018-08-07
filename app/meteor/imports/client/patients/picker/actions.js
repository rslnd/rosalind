import map from 'lodash/map'
import { mapPatientToFields } from '../mapPatientToFields'
import { autofill, touch, untouch } from 'redux-form'
import { Search } from '../../../api/search'
import { Patients } from '../../../api/patients'

export const PATIENT_CHANGE_INPUT_VALUE = 'PATIENT_CHANGE_INPUT_VALUE'
export const PATIENT_CHANGE_VALUE = 'PATIENT_CHANGE_VALUE'
export const PATIENT_CLEAR_VALUE = 'PATIENT_CLEAR_VALUE'
export const PATIENT_LOAD_START = 'PATIENT_LOAD_START'
export const PATIENTS_RESULTS_LOADED = 'PATIENTS_RESULTS_LOADED'

export const changeInputValue = (inputValue, fieldAction, ownProps) => {
  return (dispatch, getState) => {
    if (fieldAction === 'input-change') {
      dispatch({
        type: PATIENT_CHANGE_INPUT_VALUE,
        inputValue,
        fieldAction
      })

      const shouldRefetch = (
        inputValue &&
        inputValue.length >= 1 &&
        getState().patientPicker.previousInputValue !== inputValue
      )

      if (shouldRefetch) {
        Search.actions.patientsWithAppointments
          .callPromise({ query: inputValue })
          .then(patients => {
            dispatch({
              type: PATIENTS_RESULTS_LOADED,
              patients
            })
          })
      }
    }
  }
}

export const changeValue = (patient, fieldAction, ownProps) => {
  return (dispatch, getState) => {
    switch (fieldAction) {
      case 'select-option':
        dispatch({
          type: PATIENT_CHANGE_VALUE,
          patient
        })
        return dispatch(autofillPatient(ownProps.formName, patient))

      case 'clear':
        return dispatch({
          type: PATIENT_CLEAR_VALUE
        })
    }
  }
}

export const touchPatientFields = (formName, { setTouched = true } = {}) => {
  // Note: need to touch patient.contacts[0] and [1] separately
  const changedFields = [
    ...Object.keys(mapPatientToFields())
      .map(k => `patient.${k}`)
      .filter(k => k !== 'patient.contacts'),
    'patient.contacts[0].value',
    'patient.contacts[1].value'
  ]
  return (setTouched
    ? touch(formName, ...changedFields)
    : untouch(formName, ...changedFields)
  )
}

export const loadPatient = (patientId) => {
  return (dispatch) => {
    dispatch({
      type: PATIENT_LOAD_START,
      patientId
    })

    Patients.actions.findOne.callPromise({ _id: patientId })
      .then(patient => {
        // HACK: Get rid of hardcoded form name
        dispatch(changeValue(patient, 'load', { formName: 'newAppointment' }))
      })
  }
}

const autofillPatient = (formName, patientOrQueryString) => {
  return (dispatch, getState) => {
    if (!formName) { return }

    let patient = null

    if (typeof patientOrQueryString === 'string' && patientOrQueryString.length >= 1) {
      const [ lastName, firstName ] = patientOrQueryString.split(' ')
      patient = mapPatientToFields({ patientId: 'newPatient', firstName, lastName })
    }

    if (patientOrQueryString && typeof patientOrQueryString === 'object') {
      if (patientOrQueryString.patientId === 'newPatient' && getState().patientPicker.inputValue && getState().patientPicker.inputValue.length >= 1) {
        const [ lastName, firstName ] = getState().patientPicker.inputValue.split(' ')
        patient = mapPatientToFields({ ...patientOrQueryString, lastName, firstName })
      } else {
        patient = mapPatientToFields(patientOrQueryString)
      }
    }

    if (patient) {
      map(patient, (value, field) =>
        dispatch(autofill(formName, `patient.${field}`, value))
      )

      // Reveal validation errors only if actual patient was selected
      const setTouched = patient.patientId !== 'newPatient'
      dispatch(touchPatientFields(formName, { setTouched }))
    }
  }
}
