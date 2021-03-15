import map from 'lodash/map'
import { mapPatientToFields } from '../mapPatientToFields'
import { autofill, touch, untouch } from 'redux-form'
import { Search } from '../../../api/search'
import { Patients } from '../../../api/patients'
import { Calendars } from '../../../api/calendars'
import { birthday } from '../../../util/time/format'
import { parseBirthday } from '../../../api/search/actions/patientsWithAppointments/parseBirthday'
import identity from 'lodash/identity'

export const PATIENT_CHANGE_INPUT_VALUE = 'PATIENT_CHANGE_INPUT_VALUE'
export const PATIENT_CHANGE_VALUE = 'PATIENT_CHANGE_VALUE'
export const PATIENT_CLEAR_VALUE = 'PATIENT_CLEAR_VALUE'
export const PATIENT_LOAD_START = 'PATIENT_LOAD_START'
export const PATIENTS_RESULTS_LOADED = 'PATIENTS_RESULTS_LOADED'
export const PATIENT_SET_PARTIAL = 'PATIENT_SET_PARTIAL'

export const changeInputValue = (inputValue, fieldAction = 'input-change', ownProps) => {
  return (dispatch, getState) => {
    if (typeof inputValue === 'object') {
      const partialPatient = {
        lastName: inputValue.lastName,
        firstName: inputValue.firstName,
        telephone: inputValue.telephone,
        birthday: (() => {
          const r = parseBirthday(inputValue.birthday).result
          return {
            year: r['birthday.year'],
            month: r['birthday.month'],
            day: r['birthday.day']
          }
        })()
      }

      dispatch({
        type: PATIENT_SET_PARTIAL,
        partialPatient
      })

      const query = [
        inputValue.lastName,
        inputValue.firstName,
        inputValue.birthday
      ].filter(identity).join(' ')

      inputValue = query
    }

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
              patients: (patients || []).map(p => ({
                ...p,
                appointments: (p.appointments || []).map(a => ({
                  ...a,
                  calendar: Calendars.findOne({ _id: a.calendarId })
                }))
              }))
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
      case 'load':
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
        // TODO: Get rid of hardcoded form name
        dispatch(changeValue(patient, 'load', { formName: 'newAppointment' }))
      })
  }
}

const autofillPatient = (formName, patientOrQueryString) => {
  return (dispatch, getState) => {
    if (!formName) { return }

    let patient = null

    if (typeof patientOrQueryString === 'string' && patientOrQueryString.length >= 1) {
      console.log('autofill from string')
      const [ lastName, firstName ] = patientOrQueryString.split(' ')
      patient = mapPatientToFields({ patientId: 'newPatient', firstName, lastName })
    }

    if (patientOrQueryString && typeof patientOrQueryString === 'object') {
      console.log('autofill from object')
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

      // patient.contacts[0] has channel: 'Phone'
      // dispatch(autofill(formName, `patient.contacts[0].value`, '01010100101010'))

      // Reveal validation errors only if actual patient was selected
      const setTouched = patient.patientId !== 'newPatient'
      dispatch(touchPatientFields(formName, { setTouched }))
    }
  }
}
