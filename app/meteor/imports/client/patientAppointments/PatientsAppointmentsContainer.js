import { compose } from 'recompose'
import { PatientAppointmentsModal } from './PatientAppointmentsModal'
import { withTracker } from '../components/withTracker'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'

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

  return {
    ...props,
    currentAppointment,
    fullNameWithTitle
  }
}

export const PatientsAppointmentsContainer = compose(
  withTracker(composer)
)(PatientAppointmentsModal)
