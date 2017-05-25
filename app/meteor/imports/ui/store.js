import { createStore, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import appointments, { form as appointmentsForm } from './appointments/reducers'
import { form as inboundCallsForm } from './inboundCalls/reducers'
import { form as schedulesForm } from './schedules/reducers'

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
