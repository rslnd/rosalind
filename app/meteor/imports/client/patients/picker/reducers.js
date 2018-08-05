import {
  PATIENT_CHANGE_INPUT_VALUE,
  PATIENT_CHANGE_VALUE,
  PATIENTS_RESULTS_LOADED
} from './actions'

const initialState = {
  inputValue: '',
  patient: null,
  isUpserting: false,
  options: [],
  isLoading: false
}

export default (state, action) => {
  if (typeof state === 'undefined') {
    return initialState
  }

  switch (action.type) {
    case PATIENTS_RESULTS_LOADED:
      return {
        ...state,
        isLoading: false,
        options: action.patients
      }
    case PATIENT_CHANGE_INPUT_VALUE:
      // Keep inputValue untouched when dropdown is closed, blurred, or a selection is made
      if (action.fieldAction === 'input-change') {
        return {
          ...state,
          patient: null,
          isUpserting: false,
          isLoading: Boolean(action.inputValue),
          inputValue: action.inputValue
        }
      } else {
        return state
      }
    case PATIENT_CHANGE_VALUE:
      if (action.patient) {
        return {
          ...state,
          inputValue: '',
          patient: action.patient,
          isUpserting: true
        }
      } else {
        return {
          ...state,
          patient: null,
          isUpserting: false
        }
      }
    case 'APPOINTMENT_INSERT_SUCCESS':
      return initialState
    default:
      return state
  }
}
