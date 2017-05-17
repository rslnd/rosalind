import { combineReducers } from 'redux'
import { search } from './search'

const newAppointment = (state, action) => {
  switch (action.type) {
    case 'APPOINTMENT_INSERT_SUCCESS':
      return undefined
    case 'OPEN_NEW_PATIENT':
      return { ...state,
        values: {
          ...state.values,
          gender: action.autofill.gender,
          firstName: action.autofill.firstName,
          lastName: action.autofill.lastName,
          telephone: null,
          email: null,
          birthday: null
        }
      }
    case 'CLOSE_NEW_PATIENT':
      return { ...state,
        values: {
          ...state.values,
          firstName: null,
          lastName: null,
          telephone: null,
          email: null,
          birthday: null
        }
      }
    case 'NEW_PATIENT_SWAP_NAME_FIELDS':
      return { ...state,
        values: {
          ...state.values,
          firstName: state.values.lastName,
          lastName: state.values.firstName
        }
      }
    default:
      return state
  }
}


export default combineReducers({
  search
})

export const form = {
  newAppointment
}
