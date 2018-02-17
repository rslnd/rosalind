import moment from 'moment'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Calendars } from '../../../api/calendars'
import { AppointmentsScreen } from './AppointmentsScreen'

const composer = (props, onData) => {
  const { match } = props

  const date = moment(match.params.date)
  const calendar = Calendars.findOne({ slug: match.params.calendar })
  if (!calendar) { return }

  onData(null, { calendar, date })
}

export const AppointmentsContainer = composeWithTracker(composer)(AppointmentsScreen)
