import identity from 'lodash/identity'
import { compose, withState } from 'recompose'
import { PatientAppointmentsModal } from './PatientAppointmentsModal'
import { withTracker } from '../components/withTracker'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'
import { Patients } from '../../api/patients'
import { subscribe } from '../../util/meteor/subscribe'
import { Meteor } from 'meteor/meteor'
import { hasRole } from '../../util/meteor/hasRole'
import { connect } from 'react-redux'

const fullNameWithTitle = _id => {
  const user = _id && Users.findOne({ _id })
  return user && Users.methods.fullNameWithTitle(user)
}

const composer = props => {
  const {
    appointmentId,
    filter
  } = props

  const currentAppointment = Appointments.findOne({ _id: appointmentId })
  const patientId = currentAppointment ? currentAppointment.patientId : props.patientId
  const patient = Patients.findOne({ _id: patientId })

  const userId = Meteor.userId()
  const canRefer = hasRole(userId, ['referrals', 'referrals-immediate', 'referrals-delayed'])

  const loading = patientId && !subscribe('appointments-patient', { patientId }).ready()

  if (patientId) {
    subscribe('media', { patientId })
  }

  if (patientId && canRefer) {
    canRefer && subscribe('referrals', {
      patientIds: [patientId]
    })
  }

  const otherAppointments = patient ? Appointments.find({
    patientId
  }, { removed: true, sort: { start: 1 } }).fetch().filter(a =>
    currentAppointment
      ? a._id !== currentAppointment._id
      : true
  ) : []

  const now = currentAppointment ? currentAppointment.start : (new Date())
  const futureAppointments = otherAppointments && otherAppointments.filter(a =>
    a.start > now
  )

  const unfilteredPastAppointments = otherAppointments.filter(a =>
    a.start < now
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
      if (a.admitted) {
        return acc + (a.revenue || 0)
      } else {
        return acc
      }
    }, 0) +
      ((currentAppointment && currentAppointment.revenue) || 0) +
      (patient.externalRevenue || 0)

    const patientSinceCandidates = [
      patient.patientSince,
      (unfilteredPastAppointments[0] && unfilteredPastAppointments[0].start)
    ].filter(identity)

    if (patientSinceCandidates.length >= 1) {
      patient.patientSince = new Date(Math.min(...patientSinceCandidates))
    }
  }

  return {
    ...props,
    loading,
    currentAppointment,
    patient,
    pastAppointments,
    futureAppointments,
    unfilteredPastAppointments,
    otherAppointments,
    canceledCount,
    fullNameWithTitle,
    canRefer
  }
}

export const PatientsAppointmentsContainer = compose(
  connect(),
  withState('filter', 'setFilter', null), // default filter is loaded from user preferences
  withTracker(composer)
)(PatientAppointmentsModal)
