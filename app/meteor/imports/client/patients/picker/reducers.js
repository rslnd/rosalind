import {
  PATIENT_CHANGE_INPUT_VALUE,
  PATIENT_CHANGE_VALUE,
  PATIENTS_RESULTS_LOADED,
  PATIENT_LOAD_START,
  PATIENT_CLEAR_VALUE
} from './actions'

const initialState = {
  inputValue: '',
  previousInputValue: '',
  patient: null,
  options: [],
  isLoading: false
}

export default (state, action) => {
  if (typeof state === 'undefined') {
    return initialState
  }

  switch (action.type) {
    case PATIENT_LOAD_START:
      return {
        ...initialState,
        isLoading: true,
        patient: {
          patientId: action.patientId
        }
      }
    case PATIENTS_RESULTS_LOADED:
      return {
        ...state,
        isLoading: false,
        options: (action.patients || [])
      }
    case PATIENT_CHANGE_INPUT_VALUE:
      return {
        ...state,
        isLoading: Boolean(action.inputValue),
        inputValue: action.inputValue
      }
    case PATIENT_CLEAR_VALUE:
      return {
        ...state,
        inputValue: state.previousInputValue || state.inputValue,
        isLoading: false,
        patient: null
      }
    case PATIENT_CHANGE_VALUE:
      return {
        ...state,
        previousInputValue: state.inputValue || state.previousInputValue,
        inputValue: '',
        isLoading: false,
        patient: action.patient
      }
    case 'APPOINTMENT_INSERT_SUCCESS':
      return initialState
    case 'BULK_UPSERT_SUCCESS':
      return initialState
    default:
      return state
  }
}
