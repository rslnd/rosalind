import idx from 'idx'
import moment from 'moment'
import identity from 'lodash/identity'
import { toClass } from 'recompose'
import { withTracker } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Roles } from 'meteor/alanning:roles'
import Alert from 'react-s-alert'
import { Appointments } from '../../../api/appointments'
import { Users } from '../../../api/users'
import { Patients } from '../../../api/patients'
import { WaitlistScreen } from './WaitlistScreen'
import { subscribe } from '../../../util/meteor/subscribe'

const action = (action, appointmentId, options = {}, args = {}) => {
  const fn = () => Appointments.actions[action].callPromise({
    appointmentId,
    ...args
  })
    .then(() => {
      Alert.success(TAPi18n.__(`appointments.${action}Success`))
    })
    .catch((e) => {
      console.error(e)
      Alert.error(TAPi18n.__(`appointments.error`))
    })

  const title = options.alternative
    ? TAPi18n.__(`appointments.${action}Alternative`)
    : TAPi18n.__(`appointments.${action}`)

  return { title, fn }
}

const composer = props => {
  const startOfToday = moment().startOf('day').toDate()
  const endOfToday = moment().endOf('day').toDate()

  const username = idx(props, _ => _.match.params.username)
  const user = username && Users.findOne({ username })
  const assigneeId = (user && user._id) || Meteor.userId()

  const selector = {
    $or: [
      { assigneeId },
      { waitlistAssigneeId: assigneeId }
    ],
    patientId: { $ne: null },
    admittedAt: { $ne: null },
    treatmentEnd: null,
    start: {
      $gt: startOfToday,
      $lt: endOfToday
    }
  }

  const appointments = Appointments.find(selector, {
    sort: { admittedAt: 1 }
  }).fetch()

  const filteredAppointments = appointments.filter(a => {
    // If this appt was reassigned (ie. has waitlistAssigneeId set)
    // then remove it from original assigneeId's waitlist
    if (a.waitlistAssigneeId) {
      if (a.waitlistAssigneeId === assigneeId) {
        return true
      }
      return false
    } else {
      return true
    }
  })

  subscribe('referrals', {
    patientIds: filteredAppointments.map(a => a.patientId).filter(identity)
  })

  const waitlistAppointments = filteredAppointments.map(appointment => {
    const patient = Patients.findOne({ _id: appointment.patientId })

    return {
      ...appointment,
      patient
    }
  })

  const canViewAllWaitlists = Roles.userIsInRole(Meteor.userId(), [
    'admin',
    'waitlist-all'
  ])

  const canChangeWaitlistAssignee = Roles.userIsInRole(Meteor.userId(), [
    'admin',
    'waitlist-change'
  ])

  const handleChangeAssigneeView = assigneeId => {
    const user = Users.findOne({ _id: assigneeId })
    const path = `/waitlist/${user ? user.username : ''}${props.location.search}`
    props.history.replace(path)
  }

  console.log(selector, appointments, waitlistAppointments)

  return {
    action,
    appointments: waitlistAppointments,
    canViewAllWaitlists,
    canChangeWaitlistAssignee,
    handleChangeAssigneeView
  }
}

export const WaitlistContainer = withTracker(composer)(toClass(WaitlistScreen))
