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
    // onMoveStart,
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
      patientIds: [patientId]
    })
  }

  const otherAppointments = (patient && currentAppointment) ? Appointments.find({
    _id: { $ne: currentAppointment._id },
    patientId
  }, { removed: true, sort: { start: 1 } }).fetch() : []

  const futureAppointments = otherAppointments && otherAppointments.filter(a =>
    a.start > currentAppointment.start
  )

  const unfilteredPastAppointments = otherAppointments.filter(a =>
    a.start < currentAppointment.start
  )

  const pastAppointments = filter
    ? unfilteredPastAppointments.filter(a =>
      (filter.calendarId ? (a.calendarId === filter.calendarId) : true) &&
      (filter.assigneeId ? (a.assigneeId === filter.assigneeId) : true) &&
      (filter.removed ? true : (!(a.removed || a.canceled)))
    )
    : unfilteredPastAppointments.filter(a => (!(a.removed || a.canceled)))

  const canceledCount = otherAppointments.filter(a => (a.canceled || a.removed)).length

  if (patient) {
    patient.totalRevenue = otherAppointments.reduce((acc, a) => {
      if (!a.canceled && !a.removed) {
        return acc + (a.revenue || 0)
      } else {
        return acc
      }
    }, 0) + (currentAppointment.revenue || 0)
  }

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
  withState('filter', 'setFilter', null), // default filter is loaded from user preferences
  withTracker(composer)
)(PatientAppointmentsModal)
