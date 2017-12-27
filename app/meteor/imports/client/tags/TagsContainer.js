import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import Alert from 'react-s-alert'
import { Tags } from '../../api/tags'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { Loading } from '../components/Loading'
import { TagsScreen } from './TagsScreen'

const composer = (props, onData) => {
  const tags = Tags.find({}, { sort: { order: 1 } }).fetch()

  const getCalendarName = id => id && Calendars.findOne(id).name
  const getAssigneeName = id => id && Users.findOne(id).fullNameWithTitle()

  onData(null, { tags, getCalendarName, getAssigneeName })
}

export const TagsContainer = composeWithTracker(composer, Loading)(TagsScreen)
