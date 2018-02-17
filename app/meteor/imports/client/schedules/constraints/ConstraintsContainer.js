import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { toClass } from 'recompose'
import { Users } from '../../../api/users'
import { Schedules } from '../../../api/schedules'
import { Calendars } from '../../../api/calendars'
import { Loading } from '../../components/Loading'
import { ConstraintsScreen } from './ConstraintsScreen'

const composer = (props, onData) => {
  const constraints = Schedules.find({
    type: 'constraint'
  }, { sort: { order: 1 } }).fetch()

  const getCalendarName = id => id && Calendars.findOne(id) && Calendars.findOne(id).name
  const getAssigneeName = id => id && Users.findOne(id).fullNameWithTitle()
  const handleUpdate = (_id, update) => {
    Schedules.update({ _id }, update)
  }

  onData(null, { constraints, getCalendarName, getAssigneeName, handleUpdate })
}

export const ConstraintsContainer = composeWithTracker(composer, Loading)(toClass(ConstraintsScreen))
