import { Match } from 'meteor/check'
import { action } from '../../../util/meteor/action'
import { Accounts } from 'meteor/accounts-base'
import { Roles } from 'meteor/alanning:roles'

export const insert = ({ Users }) =>
  action({
    name: 'users/insert',
    args: {
      username: String,
      password: Match.Maybe(String),
      lastName: String,
      roles: Match.Maybe(String),
      firstName: Match.Maybe(String),
      titlePrepend: Match.Maybe(String),
      titleAppend: Match.Maybe(String),
      employee: Match.Maybe(Boolean),
      groupId: Match.Maybe(String)
    },
    roles: ['admin', 'users-edit'],
    simulation: false,
    fn: async (args) => {
      const { username, password, roles, ...profile } = args

      const userId = password
        ? Accounts.createUser({ username, password })
        : Accounts.createUser({ username })

      console.log('[Users] insert', userId, username)

      Users.update({ _id: userId }, {
        $set: profile
      })

      if (roles) {
        const rolesArray = roles.replace(/\s/ig, '').split(',')
        console.log('[Users] insert: Set user', userId, 'roles', rolesArray)
        Roles.setUserRoles([userId], rolesArray, Roles.GLOBAL_GROUP)
      }

      return userId
    }
  })
