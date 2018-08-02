import idx from 'idx'
import { withPromise } from '../../components/withPromise'
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
    .catch(e => {
      console.error('search/patientsWithAppointments', e)
    })
  } else {
    return Promise.resolve([])
  }
}

let lastQueryId = 0
const compose = (props) => {
  const { patientId, query } = props
  const currentQueryId = (lastQueryId + 1)
  lastQueryId = currentQueryId

  if (patientId) {
    return Patients.actions.findOne.callPromise({ _id: patientId })
      .then((patient) => findAppointments(patientId))
      .then(({ options }) => {
        if (!options || !options[0]) {
          console.log('[AppointmentsSearchContainer] No results')
          return Promise.resolve({ ...props, query, findAppointments })
        }
        const patient = options[0].patient

        if (patient && currentQueryId === lastQueryId) {
          return {
            ...props,
            findAppointments,
            query: {
              patient,
              value: `patient-${patient._id}`
            },
            options
          }
        } else {
          console.log('[AppointmentsSearchContainer] queryId does not match last query')
          return Promise.resolve({ ...props, query, findAppointments })
        }
      })
      .catch(e => {
        console.error('patients/findOne', e)
        return Promise.resolve({ ...props, query, findAppointments })
      })
  } else {
    return Promise.resolve({ ...props, query, findAppointments })
  }
}

const AppointmentsSearchComposed = withPromise(compose)(AppointmentsSearch)

const mapStateToProps = (store) => {
  return {
    patientId: idx(store, _ => _.appointments.search.patientId) || null,
    query: idx(store, _ => _.appointments.search.query) || null
  }
}

const AppointmentsSearchConnected = connect(mapStateToProps, {
  handleQueryChange: query => {
    return {
      type: 'APPOINTMENTS_SEARCH_QUERY_CHANGE',
      query
    }
  }
})(AppointmentsSearchComposed)

export const AppointmentsSearchContainer = AppointmentsSearchConnected
