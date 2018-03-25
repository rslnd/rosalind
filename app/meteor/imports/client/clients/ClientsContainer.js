import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import { Clients } from '../../api/clients'
import { Users } from '../../api/users'
import { Groups } from '../../api/groups'
import { Loading } from '../components/Loading'
import { ClientsScreen } from './ClientsScreen'
import { composer as settings } from '../system/settings/SettingsContainer'

const composer = (props) => {
  Meteor.subscribe('clients')

  const clients = Clients.find({}, { sort: { lastActionAt: -1 } }).fetch()

  const getAssigneeName = id => id && Users.methods.fullNameWithTitle(Users.findOne(id))
  const getGroupName = id => id && Groups.findOne(id).name
  const handleUpdate = (_id, update) => {
    Clients.update({ _id }, update)
  }

  return {
    clients,
    getAssigneeName,
    getGroupName,
    handleUpdate
  }
}

export const ClientsContainer = withTracker(settings)(withTracker(composer, Loading)(ClientsScreen))