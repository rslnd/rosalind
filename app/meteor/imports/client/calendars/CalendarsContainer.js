import { withTracker } from 'meteor/react-meteor-data'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { CalendarsScreen } from './CalendarsScreen'

const composer = (props) => {
  const calendars = Calendars.find({}, { sort: { order: 1 } }).fetch()

  const getCalendarName = id => id && Calendars.findOne(id) && Calendars.findOne(id).name
  const getAssigneeName = id => id && Users.methods.fullNameWithTitle(Users.findOne(id))
  const handleUpdate = (_id, update) => {
    Calendars.update({ _id }, update)
  }

  return { calendars, getCalendarName, getAssigneeName, handleUpdate }
}

export const CalendarsContainer = withTracker(composer)(CalendarsScreen)
