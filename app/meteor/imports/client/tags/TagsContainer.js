import { withTracker } from 'meteor/react-meteor-data'
import { Tags } from '../../api/tags'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { Loading } from '../components/Loading'
import { TagsScreen } from './TagsScreen'

const composer = (props) => {
  const tags = Tags.find({}, { sort: { order: 1 } }).fetch()

  const getCalendarName = id => id && Calendars.findOne(id) && Calendars.findOne(id).name
  const getAssigneeName = id => id && Users.methods.fullNameWithTitle(Users.findOne(id))
  const handleUpdate = (_id, update) => {
    Tags.update({ _id }, update)
  }

  return { tags, getCalendarName, getAssigneeName, handleUpdate }
}

export const TagsContainer = withTracker(composer)(TagsScreen)
