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
      hiddenInReports: Match.Maybe(Boolean),
      groupId: Match.Maybe(String)
    },
    roles: ['admin', 'users-edit'],
    simulation: false,
    fn: async (args) => {
      const { username, password, roles, ...profile } = args

      // createUserAsync, awaited: on the Meteor 3 server Accounts.createUser IS
      // createUserAsync, so the unawaited call yielded a Promise and every
      // downstream use of `userId` silently addressed a nonexistent document.
      const userId = password
        ? await Accounts.createUserAsync({ username, password })
        : await Accounts.createUserAsync({ username })

      console.log('[Users] insert', userId, username)

      await Users.updateAsync({ _id: userId }, {
        $set: profile
      })

      return userId
    }
  })
