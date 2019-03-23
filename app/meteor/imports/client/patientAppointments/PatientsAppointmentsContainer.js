import { compose, withState } from 'recompose'
import { PatientAppointmentsModal } from './PatientAppointmentsModal'
import { withTracker } from '../components/withTracker'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'
import { Patients } from '../../api/patients'
import { subscribe } from '../../util/meteor/subscribe'
import { Meteor } from 'meteor/meteor'

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
  const patientId = patient && patient._id

  Meteor.defer(() => {
    if (patient) {
      subscribe('appointments-patient', { patientId })
    }
  })

  let [pastAppointments, futureAppointments] = currentAppointment ? [
    Appointments.find({
      patientId,
      start: {
        $lt: currentAppointment.start
      }
    }, { removed: true }).fetch(),
    Appointments.find({
      patientId,
      start: {
        $gt: currentAppointment.start
      }
    }, { removed: true }).fetch()
  ] : [[], []]

  return {
    ...props,
    currentAppointment,
    patient,
    pastAppointments,
    futureAppointments,
    fullNameWithTitle
  }
}

export const PatientsAppointmentsContainer = compose(
  withState('filter', 'setFilter'),
  withTracker(composer)
)(PatientAppointmentsModal)
