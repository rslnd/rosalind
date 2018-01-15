import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { connect } from 'react-redux'
import { Patients } from '../../../api/patients'
import { Users } from '../../../api/users'
import { Search } from '../../../api/search'
import { AppointmentsSearch } from './AppointmentsSearch'

const findAppointments = (query) => {
  if (query && query.length > 1) {
    return Search.actions.patientsWithAppointments.callPromise({ query }).then((patientsWithAppointments) => {
      let options = []
      let lastPatientId = null

      patientsWithAppointments && patientsWithAppointments.forEach((result) => {
        if (lastPatientId !== result._id) {
          lastPatientId = result._id
          options.push({
            value: `patient-${result._id}`,
            patient: { ...result, appointments: undefined }
          })
        }

        result.appointments && result.appointments.forEach((appointment) => {
          options.push({
            label: `appointment-${appointment._id}`,
            assignee: appointment.assigneeId && Users.findOne({ _id: appointment.assigneeId }),
            value: appointment._id,
            appointment
          })
        })
      })
      return { options }
    })
  } else {
    return new Promise((resolve) => {
      resolve([])
    })
  }
}

const compose = (props, onData) => {
  const { patientId, query } = props

  if (patientId) {
    Patients.actions.findOne.callPromise({ _id: patientId })
      .then((patient) => findAppointments(patientId))
      .then(({ options }) => {
        const patient = options[0].patient

        console.log('injecting to search', patient)
        onData(null, {
          findAppointments,
          query: {
            patient,
            value: `patient-${patient._id}`
          },
          options
        })
      })
  } else {
    onData(null, { query, findAppointments })
  }
}

const AppointmentsSearchComposed = composeWithTracker(compose)(AppointmentsSearch)

const mapStateToProps = (store) => {
  return {
    patientId: store.appointments.search.patientId,
    query: store.appointments.search.query
  }
}

const AppointmentsSearchConnected = connect(mapStateToProps)(AppointmentsSearchComposed)

export const AppointmentsSearchContainer = AppointmentsSearchConnected
