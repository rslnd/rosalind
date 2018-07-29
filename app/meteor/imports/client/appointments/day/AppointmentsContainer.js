import moment from 'moment'
import { withTracker } from '../../components/withTracker'
import { Calendars } from '../../../api/calendars'
import { AppointmentsScreen } from './AppointmentsScreen'

const composer = (props) => {
  const { match } = props

  const date = moment(match.params.date)
  const calendar = Calendars.findOne({ slug: match.params.calendar })
  if (!calendar) { return }

  return { calendar, date }
}

export const AppointmentsContainer = withTracker(composer)(AppointmentsScreen)
