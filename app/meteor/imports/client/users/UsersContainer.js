import { withTracker } from '../components/withTracker'
import { toClass } from 'recompose'
import { Users } from '../../api/users'
import { Groups } from '../../api/groups'
import { subscribe } from '../../util/meteor/subscribe'
import { UsersScreen } from './UsersScreen'
import { hasRole } from '../../util/meteor/hasRole'

const composer = (props) => {
  subscribe('users-permissions')

  const { removed } = props

  const groupedUsers = Groups.find({}, { sort: { order: 1 } }, { removed })
    .fetch()
    .map(g => ({
      ...g,
      users: Users.find({ groupId: g._id, removed }, { sort: { lastName: 1 }, removed }).fetch()
    }))

  const groups = [{
    _id: 'other',
    name: 'Benutzer',
    icon: 'users',
    users: Users.find({ groupId: null, removed }, { sort: { lastName: 1 }, removed }).fetch()
  }, ...groupedUsers]

  const getAssigneeName = id => id && Users.methods.fullNameWithTitle(Users.findOne(id, { removed: true }))
  const isInRole = (user, role) => hasRole(user._id, [role])
  const handleUpdate = (_id, update) => {
    Users.update({ _id }, update)
  }

  return { groups, getAssigneeName, handleUpdate, isInRole }
}

export const UsersContainer = withTracker(composer)(toClass(UsersScreen))
