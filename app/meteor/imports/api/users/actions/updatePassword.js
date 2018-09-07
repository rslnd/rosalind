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
    fn: async ({ userId, password }) => {
      console.log('[Users] Setting password for user', userId)
      Events.post('users/updatePassword', { userId }, 'warning')
      Accounts.setPassword(userId, password, { logout: false })
    }
  })
