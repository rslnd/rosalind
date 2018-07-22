import { withTracker } from 'meteor/react-meteor-data'
import { Patients } from 'api/patients'
import { PatientProfile } from './PatientProfile'

const composer = (props) => {
  const patient = Patients.findOne({ _id: props.patientId })
  return { patient }
}

const PatientProfileContainer = withTracker(composer)(PatientProfile)

export { PatientProfileContainer }
