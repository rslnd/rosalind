import moment from 'moment'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Appointments } from '../../../api/appointments'
import { Patients } from '../../../api/patients'
import { WaitlistScreen } from './WaitlistScreen'

const composer = (props, onData) => {
  const startOfToday = moment().startOf('day').toDate()
  const endOfToday = moment().endOf('day').toDate()

  Meteor.subscribe('appointments', {
    start: startOfToday,
    end: endOfToday
  })

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
  }).fetch().map(appointment => ({
    ...appointment,
    patient: Patients.findOne({ _id: appointment.patientId })
  }))

  onData(null, { ...props, appointments })
}

export const WaitlistContainer = composeWithTracker(composer)(WaitlistScreen)
