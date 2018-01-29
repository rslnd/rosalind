import moment from 'moment'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Appointments } from '../../../api/appointments'
import { WaitlistScreen } from './WaitlistScreen'

const composer = (props, onData) => {
  Meteor.subscribe('appointments', {
    start: moment().startOf('day').toDate(),
    end: moment().endOf('day').toDate()
  })

  const appointments = Appointments.find({}).fetch()

  onData(null, { ...props, appointments })
}

export const WaitlistContainer = composeWithTracker(composer)(WaitlistScreen)
