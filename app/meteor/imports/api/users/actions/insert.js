import { Match } from 'meteor/check'
import { action } from '../../../util/meteor/action'
import { Accounts } from 'meteor/accounts-base'

export const insert = ({ Users }) =>
  action({
    name: 'users/insert',
    args: {
      username: String,
      password: Match.Maybe(String),
      lastName: String,
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

      return userId
    }
  })
