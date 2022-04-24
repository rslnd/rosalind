import identity from 'lodash/identity'
import sortBy from 'lodash/sortBy'
import { compose, withState } from 'recompose'
import { PatientAppointmentsModal } from './PatientAppointmentsModal'
import { withTracker } from '../components/withTracker'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'
import { Patients } from '../../api/patients'
import { Calendars } from '../../api/calendars'
import { subscribe } from '../../util/meteor/subscribe'
import { Meteor } from 'meteor/meteor'
import { hasRole } from '../../util/meteor/hasRole'
import { connect } from 'react-redux'
import { Media } from '../../api'
import { getClient } from '../../api/clients/methods/getClient'

const fullNameWithTitle = _id => {
  const user = _id && Users.findOne({ _id }, { removed: true })
  return user && Users.methods.fullNameWithTitle(user)
}

const composer = props => {
  console.log('PatientsAppointmentsContainer', props)
  const {
    appointmentId,
    filter,
    page
  } = props

  const currentAppointment = Appointments.findOne({ _id: appointmentId })
  const patientId = currentAppointment ? currentAppointment.patientId : props.patientId
  const patient = Patients.findOne({ _id: patientId })

  console.log('patientId', patientId)

  if (patientId) {
    subscribe('patient', { patientId })
    subscribe('patient-comments', { patientId })
    subscribe('media', { patientId })

    const subArgs = {
      patientId,
      page,
      calendarId: filter ? filter.calendarId : null,
      assigneeId: filter ? filter.assigneeId : null,
    }

    subscribe('appointments-patient', subArgs)
    subscribe('appointments-patient-comments', subArgs)
  }

  const userId = Meteor.userId()
  const canRefer = hasRole(userId, ['referrals', 'referrals-immediate', 'referrals-delayed'])

  if (patientId && canRefer) {
    canRefer && subscribe('referrals', {
      patientIds: [patientId]
    })
  }

  // do not sort -1 for skip/limit pagination from newest and then reverse for display,
  // since the publication limits to pageSize on the server
  const otherAppointments = (patient ? Appointments.find({
    patientId
  }, {
    removed: true,
    sort: { start: 1 }
  }).fetch().filter(a =>
    currentAppointment
      ? a._id !== currentAppointment._id
      : true
  ) : [])
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
    // patient.totalRevenue = otherAppointments.reduce((acc, a) => {
    //   if (a.admitted) {
    //     return acc + (a.revenue || 0)
    //   } else {
    //     return acc
    //   }
    // }, 0) +
    //   ((currentAppointment && currentAppointment.revenue) || 0) +
    //   (patient.externalRevenue || 0)

    // const patientSinceCandidates = [
    //   patient.patientSince,
    //   (unfilteredPastAppointments[0] && unfilteredPastAppointments[0].start)
    // ].filter(identity)

    // if (patientSinceCandidates.length >= 1) {
    //   patient.patientSince = new Date(Math.min(...patientSinceCandidates))
    // }
  }

  const floatingMedia = Media.find({
    patientId,
    appointmentId: null,
    kind: 'photo'
  }, {
    sort: {
      createdAt: 1
    }
  }).fetch().map(m => ({
    ...m,
    start: m.createdAt, // Same sort key as appointments, see below
    type: 'media'
  }))

  const pastAppointmentsWithFloatingMedia =
    sortBy([
      ...pastAppointments,
      ...floatingMedia
    ], 'start').reduce((acc, curr) => {
      if (curr.type !== 'media') {
        return { last: null, list: [ ...acc.list, curr ] }
      }

      if (!acc.last) {
        return {
          last: 'media',
          list: [
            ...acc.list,
            { type: 'media', media: [curr] }
          ] }
      }

      return {
        last: 'media',
        list: [
          ...butlast(acc.list),
          {
            type: 'media',
            media: [...((last(acc.list)).media), curr]
          }
        ]
      }
    }, { last: null, list: [] }).list

  const calendar = currentAppointment &&
    currentAppointment.calendarId &&
    Calendars.findOne({ _id: currentAppointment.calendarId })

  const client = getClient()
  const currentCycle = client && client.nextMedia && client.nextMedia.cycle

  const onClose = (e) => {
    console.log('onClose intercepted, resetting page')
    props.setPage && props.setPage(0)
    return props.onClose(e)
  }

  return {
    ...props,
    onClose,
    patientId,
    // loading, // debugging random closing
    currentAppointment,
    patient,
    pastAppointments,
    pastAppointmentsWithFloatingMedia,
    futureAppointments,
    unfilteredPastAppointments,
    otherAppointments,
    canceledCount,
    fullNameWithTitle,
    canRefer,
    calendar,
    currentCycle
  }
}

const butlast = xs => xs.slice(0, xs.length - 1)
const last = xs => xs.slice(xs.length - 1)[0]

export const PatientsAppointmentsContainer = compose(
  connect(),
  withState('filter', 'setFilter', null), // default filter is loaded from user preferences
  withState('page', 'setPage', 0),
  withTracker(composer)
)(PatientAppointmentsModal)
