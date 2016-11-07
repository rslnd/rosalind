import { composeWithTracker } from 'react-komposer'
import { connect } from 'react-redux'
import { Patients } from 'api/patients'
import { AppointmentsSearch } from './AppointmentsSearch'

const compose = (props, onData) => {
  const { patientId, query } = props

  if (patientId) {
    Patients.actions.findOne.callPromise({ _id: patientId }).then((patient) => {
      onData(null, {
        query: {
          patient,
          value: `patient-${patient._id}` }
      })
    })
  } else {
    onData(null, { query })
  }
}

const AppointmentsSearchComposed = composeWithTracker(compose)(AppointmentsSearch)

const mapStateToProps = (store) => {
  return {
    patientId: store.appointmentsSearch.patientId,
    query: store.appointmentsSearch.query
  }
}

const AppointmentsSearchConnected = connect(mapStateToProps)(AppointmentsSearchComposed)

export const AppointmentsSearchContainer = AppointmentsSearchConnected
