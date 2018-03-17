import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Clients } from '../../api/clients'
import { Users } from '../../api/users'
import { Groups } from '../../api/groups'
import { Loading } from '../components/Loading'
import { ClientsScreen } from './ClientsScreen'
import { composer as settings } from '../system/settings/SettingsContainer'

const composer = (props, onData) => {
  const clients = Clients.find({}, { sort: { lastActionAt: -1 } }).fetch()

  const getAssigneeName = id => id && Users.methods.fullNameWithTitle(Users.findOne(id))
  const getGroupName = id => id && Groups.findOne(id).name
  const handleUpdate = (_id, update) => {
    Clients.update({ _id }, update)
  }

  onData(null, { clients, getAssigneeName, getGroupName, handleUpdate })
}

export const ClientsContainer = composeWithTracker(settings)(composeWithTracker(composer, Loading)(ClientsScreen))
