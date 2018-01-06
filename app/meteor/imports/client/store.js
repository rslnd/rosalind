import { createStore, combineReducers } from 'redux'
import reduceReducers from 'reduce-reducers'
import { reducer as formReducer } from 'redux-form'
import appointments from './appointments/reducers'
import { newAppointment } from './appointments/new/reducers'
import { form as inboundCallsForm } from './inboundCalls/reducers'
import { form as schedulesForm } from './schedules/reducers'
import { patientPicker } from './patients/patientPicker/reducers'

const reducers = {
  appointments,
  form: formReducer.plugin({
    newAppointment: reduceReducers(
      newAppointment,
      patientPicker
    ),
    ...inboundCallsForm,
    ...schedulesForm,
    bulkNewPatientForm: patientPicker
  })
}

const reducer = combineReducers(reducers)
export const store = createStore(reducer, window.devToolsExtension && window.devToolsExtension())
