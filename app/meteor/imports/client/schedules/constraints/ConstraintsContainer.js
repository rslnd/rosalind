import { withTracker } from '../../components/withTracker'
import { toClass } from 'recompose'
import { Users } from '../../../api/users'
import { Schedules } from '../../../api/schedules'
import { Calendars } from '../../../api/calendars'
import { ConstraintsScreen } from './ConstraintsScreen'
import { __ } from '../../../i18n'

const composer = (props) => {
  const constraints = Schedules.find({
    type: 'constraint'
  }, { sort: { order: 1 } }).fetch()

  const getCalendarName = _id => _id && Calendars.findOne({ _id }, { removed: true }) && Calendars.findOne({ _id }, { removed: true }).name
  const getAssigneeName = _id => _id && Users.methods.fullNameWithTitle(Users.findOne({ _id }, { removed: true }))
  const handleUpdate = (_id, update) => {
    Schedules.update({ _id }, update)
  }
  const handleInsert = schedule => {
    Schedules.insert(schedule)
  }
  const defaultValues = () => ({
    type: 'constraint',
    note: __('schedules.constraint')
  })

  return {
    constraints,
    getCalendarName,
    getAssigneeName,
    handleUpdate,
    handleInsert,
    defaultValues
  }
}

export const ConstraintsContainer = withTracker(composer)(toClass(ConstraintsScreen))
