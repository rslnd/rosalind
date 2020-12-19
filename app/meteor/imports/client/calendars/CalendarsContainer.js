import { withTracker } from '../components/withTracker'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { CalendarsScreen } from './CalendarsScreen'
import { prompt } from '../layout/Prompt'

const composer = (props) => {
  const calendars = Calendars.find({}, { sort: { order: 1 } }).fetch()

  const getCalendarName = _id => _id && Calendars.findOne({ _id }, { removed: true }) && Calendars.findOne({ _id }, { removed: true }).name
  const getAssigneeName = _id => _id && Users.methods.fullNameWithTitle(Users.findOne({ _id }, { removed: true }))
  const handleUpdate = (calendarId, update) =>
    Calendars.actions.update.callPromise({ calendarId, update })
  const handleInsert = (calendar) =>
    Calendars.actions.insert.callPromise({ calendar })
  const handleRemove = async (calendarId) => {
    const ok = await prompt({
      title: 'Bitte bestätigen: Kalender löschen?'
    })
    if (ok) {
      Calendars.actions.softRemove.callPromise({ calendarId })
    }
  }

  return { calendars, getCalendarName, getAssigneeName, handleUpdate, handleInsert, handleRemove }
}

export const CalendarsContainer = withTracker(composer)(CalendarsScreen)
