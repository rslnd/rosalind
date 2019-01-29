import { Meteor } from 'meteor/meteor'
import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Roles } from 'meteor/alanning:roles'
import Alert from 'react-s-alert'
import { Users } from '../../api/users'
import { Groups } from '../../api/groups'
import { Calendars } from '../../api/calendars'
import { subscribe } from '../../util/meteor/subscribe'
import { Loading } from '../components/Loading'
import { UsersScreen } from './UsersScreen'

const composer = (props) => {
  subscribe('users-permissions')

  const groupedUsers = Groups.find({}, { sort: { order: 1 } })
    .fetch()
    .map(g => ({
      ...g,
      users: Users.find({ groupId: g._id }, { sort: { lastName: 1 } }).fetch()
    }))

  const groups = [{
    _id: 'other',
    name: 'Benutzer',
    icon: 'users',
    users: Users.find({ groupId: null }, { sort: { lastName: 1 } }).fetch()
  }, ...groupedUsers]

  const getAssigneeName = id => id && Users.methods.fullNameWithTitle(Users.findOne(id), { removed: true })
  const isInRole = (user, role) => Roles.userIsInRole(user, [role])
  const handleUpdate = (_id, update) => {
    Users.update({ _id }, update)
  }

  return { groups, getAssigneeName, handleUpdate, isInRole }
}

export const UsersContainer = withTracker(composer)(toClass(UsersScreen))
