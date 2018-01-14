import { mapPatientToFields } from './mapPatientToFields'

export const mapStateToProps = selector => state => {
  const patient = state.loadPatient.data
  const fields = mapPatientToFields(patient)
  const patientId = selector(state, 'patientId')

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
