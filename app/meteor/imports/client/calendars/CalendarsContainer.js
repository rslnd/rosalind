import { withTracker } from '../components/withTracker'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { CalendarsScreen } from './CalendarsScreen'

const composer = (props) => {
  const calendars = Calendars.find({}, { sort: { order: 1 } }).fetch()

  const getCalendarName = _id => _id && Calendars.findOne({ _id }, { removed: true }) && Calendars.findOne({ _id }, { removed: true }).name
  const getAssigneeName = _id => _id && Users.methods.fullNameWithTitle(Users.findOne({ _id }, { removed: true }))
  const handleUpdate = (calendarId, update) =>
    Calendars.actions.update.callPromise({ calendarId, update })

  return { calendars, getCalendarName, getAssigneeName, handleUpdate }
}

export const CalendarsContainer = withTracker(composer)(CalendarsScreen)
