import { createStore, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

const reducers = {
  form: formReducer.plugin({
    newSchedulesRequest: (state, action) => {
      switch (action.type) {
        case 'SCHEDULES_POST_REQUEST_SUCCESS':
          return undefined
        default:
          return state
      }
    },
    newInboundCall: (state, action) => {
      switch (action.type) {
        case 'INBOUND_CALL_POST_SUCCESS':
          return undefined
        default:
          return state
      }
    },
    newAppointment: (state, action) => {
      switch (action.type) {
        case 'OPEN_NEW_PATIENT':
          return state
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
        default:
          return state
      }
    }
  })
}

const reducer = combineReducers(reducers)
export const store = createStore(reducer, window.devToolsExtension && window.devToolsExtension())
