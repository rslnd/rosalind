import moment from 'moment'
import identity from 'lodash/identity'
import { toClass } from 'recompose'
import { withTracker } from 'meteor/react-meteor-data'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import Alert from 'react-s-alert'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { WaitlistScreen } from './WaitlistScreen'

const action = (action, appointment, options = {}) => {
  const fn = () => Appointments.actions[action].callPromise({ appointmentId: appointment._id })
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

  const selector = {
    assigneeId: Meteor.userId(),
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

  Meteor.subscribe('referrals', {
    patientIds: appointments.map(a => a.patientId).filter(identity)
  })

  const waitlistAppointments = appointments.map(appointment => {
    const patient = Patients.findOne({ _id: appointment.patientId })

    return {
      ...appointment,
      patient
    }
  })

  return {
    action,
    appointments: waitlistAppointments
  }
}

export const WaitlistContainer = withTracker(composer)(toClass(WaitlistScreen))
