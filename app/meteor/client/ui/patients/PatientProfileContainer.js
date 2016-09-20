import { composeWithTracker } from 'react-komposer'
import { Patients } from 'api/patients'
import { PatientProfile } from './PatientProfile'

const composer = (props, onData) => {
  const patient = Patients.findOne({ _id: props.patientId })
  onData(null, { patient })
}

const PatientProfileContainer = composeWithTracker(composer)(PatientProfile)

export { PatientProfileContainer }
