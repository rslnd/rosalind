import idx from 'idx'
import { mapPatientToFields } from './mapPatientToFields'

export const mapStateToProps = selector => (state = {}) => {
  const patient = idx(state, _ => _.loadPatient.data) ||
    idx(state, _ => _.appointments.search.query.patient)
  const fields = mapPatientToFields(patient)
  const patientId = state ? selector(state, 'patientId') : null

  if (fields) {
    return {
      patientId,
      initialValues: fields
    }
  } else {
    return {
      patientId,
      initialValues: {
        gender: 'Female',
        contacts: [
          { channel: 'Phone' },
          { channel: 'Email' }
        ]
      }
    }
  }
}
