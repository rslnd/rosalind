import { action } from '../../../util/meteor/action'
import { Match } from 'meteor/check'
import { Events } from '../../events'
import { Roles } from 'meteor/alanning:roles'

export const updateRoles = ({ Users }) =>
  action({
    name: 'users/updateRoles',
    args: {
      userId: String,
      roles: Match.Maybe([String])
    },
    roles: ['admin', 'users-edit'],
    fn: async ({ userId, roles }) => {
      console.log('[Users] Setting roles for user', userId, roles)
      Events.post('users/updateRoles', { userId, roles }, 'warning')
      Roles.setUserRoles(userId, roles, Roles.GLOBAL_GROUP)
    }
  })
