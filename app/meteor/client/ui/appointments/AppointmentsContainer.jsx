import moment from 'moment'
import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { Appointments } from 'api/appointments'
import { Loading } from 'client/ui/components/Loading'
import { AppointmentsScreen } from './AppointmentsScreen'

const composer = (props, onData) => {
  const date = moment(props.params && props.params.date || undefined)
  const subscription = Meteor.subscribe('appointments', { date: date.clone().startOf('day').toDate() })

  if (subscription.ready()) {
    const selector = {
      start: {
        $gte: date.clone().startOf('day').toDate(),
        $lte: date.clone().endOf('day').toDate()
      }
    }

    const cursor = Appointments.find(selector, { sort: { start: 1 } })

    const appointments = cursor.fetch()
    onData(null, { appointments, date })
  } else {
    onData(null, null)
  }
}

export const AppointmentsContainer = composeWithTracker(composer, Loading)(AppointmentsScreen)
