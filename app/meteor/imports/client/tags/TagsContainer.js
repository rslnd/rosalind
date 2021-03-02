import Alert from 'react-s-alert'
import sortBy from 'lodash/fp/sortBy'
import { withTracker } from '../components/withTracker'
import { Tags } from '../../api/tags'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { TagsScreen } from './TagsScreen'
import { __ } from '../../i18n'

const sortByCalendar = sortBy(({ calendarIds }) => {
  const c = Calendars.findOne({ _id: { $in: (calendarIds || []) } }, { sortBy: { order: 1 } })
  return c && c.order || 99999999
})

const composer = (props) => {
  const tags = sortByCalendar(Tags.find({}, { sort: { order: 1 } }).fetch())

  const getCalendarName = _id => _id && ((Calendars.findOne({ _id }) || {}).name)
  const getAssigneeName = _id => _id && Users.methods.fullNameWithTitle(Users.findOne({ _id }, { removed: true }) || {})

  const action = x => x
    .then(_ => Alert.success(__('ui.saved')))
    .catch(e => { console.error(e); Alert.error(__('ui.error')) })

  const handleUpdate = (tagId, update) =>
    action(Tags.actions.update.callPromise({ tagId, update }))

  const handleInsert = (tag) =>
    action(Tags.actions.insert.callPromise({ tag }))

  const handleRemove = tagId =>
    action(Tags.actions.softRemove.callPromise({ tagId }))

  return { tags, getCalendarName, getAssigneeName, handleUpdate, handleInsert, handleRemove }
}

export const TagsContainer = withTracker(composer)(TagsScreen)
