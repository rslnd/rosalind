import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { Loading } from '../components/Loading'
import { CalendarsScreen } from './CalendarsScreen'

const composer = (props, onData) => {
  const calendars = Calendars.find({}, { sort: { order: 1 } }).fetch()

  const getCalendarName = id => id && Calendars.findOne(id) && Calendars.findOne(id).name
  const getAssigneeName = id => id && Users.findOne(id).fullNameWithTitle()
  const handleUpdate = (_id, update) => {
    Calendars.update({ _id }, update)
  }

  onData(null, { calendars, getCalendarName, getAssigneeName, handleUpdate })
}

export const CalendarsContainer = composeWithTracker(composer, Loading)(CalendarsScreen)
