import { createStore, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import appointments, { form as appointmentsForm } from './ui/appointments/reducers'
import { form as inboundCallsForm } from './ui/inboundCalls/reducers'
import { form as schedulesForm } from './ui/schedules/reducers'

const reducers = {
  appointments,
  form: formReducer.plugin({
    ...appointmentsForm,
    ...inboundCallsForm,
    ...schedulesForm
  })
}

const reducer = combineReducers(reducers)
export const store = createStore(reducer, window.devToolsExtension && window.devToolsExtension())
