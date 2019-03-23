import { compose } from 'recompose'
import { PatientAppointmentsModal } from './PatientAppointmentsModal'
import { withTracker } from '../components/withTracker'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'
import { Patients } from '../../api/patients'

const fullNameWithTitle = _id => {
  const user = _id && Users.findOne({ _id })
  return user && Users.methods.fullNameWithTitle(user)
}

const composer = props => {
  const {
    appointmentId
    // onStartMove,
    // onSetAdmitted,
    // show,
    // onClose
  } = props

  const currentAppointment = Appointments.findOne({ _id: appointmentId })
  const patient = currentAppointment && Patients.findOne({ _id: currentAppointment.patientId })

  return {
    ...props,
    currentAppointment,
    patient,
    fullNameWithTitle
  }
}

export const PatientsAppointmentsContainer = compose(
  withTracker(composer)
)(PatientAppointmentsModal)
