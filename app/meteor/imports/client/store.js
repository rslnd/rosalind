import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { reducer as formReducer } from 'redux-form'
import patientPicker from './patients/picker/reducers'
import appointments from './appointments/reducers'
import { newAppointment } from './appointments/new/reducers'
import { form as schedulesForm } from './schedules/reducers'

const reducers = {
  patientPicker,
  appointments,
  form: formReducer.plugin({
    newAppointment,
    ...schedulesForm
  })
}

const reducer = combineReducers(reducers)

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ trace: true, traceLimit: 25 })
    : compose

const enhancer = composeEnhancers(
  applyMiddleware(thunk)
)

export const store = createStore(reducer, enhancer)
