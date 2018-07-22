import { withTracker } from 'meteor/react-meteor-data'
import { toClass } from 'recompose'
import { Users } from '../../../api/users'
import { Schedules } from '../../../api/schedules'
import { Calendars } from '../../../api/calendars'
import { ConstraintsScreen } from './ConstraintsScreen'

const composer = (props) => {
  const constraints = Schedules.find({
    type: 'constraint'
  }, { sort: { order: 1 } }).fetch()

  const getCalendarName = id => id && Calendars.findOne(id) && Calendars.findOne(id).name
  const getAssigneeName = id => id && Users.methods.fullNameWithTitle(Users.findOne(id))
  const handleUpdate = (_id, update) => {
    Schedules.update({ _id }, update)
  }

  return { constraints, getCalendarName, getAssigneeName, handleUpdate }
}

export const ConstraintsContainer = withTracker(composer)(toClass(ConstraintsScreen))
