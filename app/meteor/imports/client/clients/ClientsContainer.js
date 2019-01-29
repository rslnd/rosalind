import { withTracker } from '../components/withTracker'
import { Clients } from '../../api/clients'
import { Users } from '../../api/users'
import { Groups } from '../../api/groups'
import { ClientsScreen } from './ClientsScreen'
import { composer as settings } from '../system/settings/SettingsContainer'
import { subscribe } from '../../util/meteor/subscribe'

const composer = (props) => {
  subscribe('clients')

  const clients = Clients.find({}, { sort: { lastActionAt: -1 } }).fetch()

  const getAssigneeName = _id => _id && Users.methods.fullNameWithTitle(Users.findOne({ _id }, { removed: true }))
  const getGroupName = id => id && Groups.findOne(id).name
  const handleUpdate = (_id, update) => {
    Clients.update({ _id }, update)
  }
  const handleRemove = (_id) => {
    Clients.softRemove({ _id })
  }

  return {
    clients,
    getAssigneeName,
    getGroupName,
    handleUpdate,
    handleRemove
  }
}

export const ClientsContainer = withTracker(settings)(withTracker(composer)(ClientsScreen))
