import { action } from '../../../util/meteor/action'
import { Accounts } from 'meteor/accounts-base'
import { Events } from '../../events'

export const updatePassword = ({ Users }) =>
  action({
    name: 'users/updatePassword',
    args: {
      userId: String,
      password: String
    },
    roles: ['admin', 'users-edit'],
    simulation: false,
    fn: async ({ userId, password }) => {
      console.log('[Users] Setting password for user', userId)
      Events.post('users/updatePassword', { userId }, 'warning')
      // Meteor 3 removed the synchronous Accounts.setPassword entirely; the old
      // call threw "Accounts.setPassword is not a function".
      await Accounts.setPasswordAsync(userId, password, { logout: false })
    }
  })
