import takeRightWhile from 'lodash/takeRightWhile'
import { compose, withState } from 'recompose'
import { PatientAppointmentsModal } from './PatientAppointmentsModal'
import { withTracker } from '../components/withTracker'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'
import { Patients } from '../../api/patients'
import { subscribe } from '../../util/meteor/subscribe'
import { Meteor } from 'meteor/meteor'
import { hasRole } from '../../util/meteor/hasRole'

const fullNameWithTitle = _id => {
  const user = _id && Users.findOne({ _id })
  return user && Users.methods.fullNameWithTitle(user)
}

const composer = props => {
  const {
    appointmentId,
    filter
    // onStartMove,
    // onSetAdmitted,
    // show,
    // onClose
  } = props

  const currentAppointment = Appointments.findOne({ _id: appointmentId })
  const patient = currentAppointment && Patients.findOne({ _id: currentAppointment.patientId })
  const patientId = patient && patient._id

  if (patient) {
    subscribe('appointments-patient', { patientId })
    const canRefer = hasRole(Meteor.userId(), ['referrals'])
    patientId && canRefer && subscribe('referrals', {
      patientIds: [ patientId ]
    })
  }

  const { removed, ...selectorFilter } = filter

  const otherAppointments = currentAppointment ? Appointments.find({
    _id: { $ne: currentAppointment._id },
    patientId
  }, { removed, sort: { start: 1 } }).fetch() : []

  const futureAppointments = otherAppointments && takeRightWhile(otherAppointments, a => a.start > currentAppointment.start)

  const unfilteredPastAppointments = otherAppointments.slice(-futureAppointments.length)
  const pastAppointments = unfilteredPastAppointments.filter(a =>
    selectorFilter.calendarId
      ? a.calendarId === selectorFilter.calendarId
      : true
  )

  const canceledCount = otherAppointments.filter(a => (a.canceled || a.removed)).length

  return {
    ...props,
    currentAppointment,
    patient,
    pastAppointments,
    futureAppointments,
    unfilteredPastAppointments,
    canceledCount,
    fullNameWithTitle
  }
}

export const PatientsAppointmentsContainer = compose(
  withState('filter', 'setFilter', {}),
  withTracker(composer)
)(PatientAppointmentsModal)
