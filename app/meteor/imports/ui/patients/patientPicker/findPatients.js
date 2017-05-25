import map from 'lodash/fp/map'
import { Search } from 'api/search'

export const findPatients = (query) => {
  return Search.actions.patientsWithAppointments.callPromise({ query })
    .then(map((patient) => {
      return {
        label: `${patient.profile.lastName} ${patient.profile.firstName}`,
        value: patient._id,
        patient
      }
    })).then((options) => {
      // Add "Create New Patient" option as first result
      return {
        options: [ {
          newPatient: true,
          value: 'newPatient',
          query
        }, ...options ]
      }
    })
}
