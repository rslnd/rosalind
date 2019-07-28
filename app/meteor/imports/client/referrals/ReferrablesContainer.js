import Alert from 'react-s-alert'
import { withTracker } from '../components/withTracker'
import { Tags } from '../../api/tags'
import { Users } from '../../api/users'
import { Calendars } from '../../api/calendars'
import { Referrables } from '../../api/referrals'
import { ReferrablesScreen } from './ReferrablesScreen'
import { __ } from '../../i18n'

const composer = (props) => {
  const referrables = Referrables.find({}, { sort: { order: 1 } }).fetch()

  const getTag = _id => _id && (Tags.findOne({ _id }) || {}).tag
  const getCalendarName = _id => _id && ((Calendars.findOne({ _id }) || {}).name)
  const getAssigneeName = _id => _id && Users.methods.fullNameWithTitle(Users.findOne({ _id }, { removed: true }) || {})

  const action = x => x
    .then(_ => Alert.success(__('ui.saved')))
    .catch(e => { console.error(e); Alert.error(__('ui.error')) })

  const handleUpdate = (referrableId, update) =>
    action(Referrables.actions.update.callPromise({ referrableId, update }))

  const handleInsert = (referrable) =>
    action(Referrables.actions.insert.callPromise({ referrable }))

  const handleRemove = (referrableId) =>
    action(Referrables.actions.softRemove.callPromise({ referrableId }))

  const defaultReferrable = () => ({
    order: 100,
    name: 'Name',
    fromCalendarIds: Calendars.find({}).fetch().map(c => c._id),
    redeemImmediately: false
  })

  return {
    referrables,
    getTag,
    getCalendarName,
    getAssigneeName,
    handleUpdate,
    handleInsert,
    handleRemove,
    defaultReferrable
  }
}

export const ReferrablesContainer = withTracker(composer)(ReferrablesScreen)
