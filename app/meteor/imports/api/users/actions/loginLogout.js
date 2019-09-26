import { action, Match } from '../../../util/meteor/action'
import { Events } from '../../events'

export const login = ({ Users }) =>
  action({
    name: 'users/afterLogin',
    roles: ['*'],
    args: {
      weakPassword: Match.OneOf(Boolean, Number, null)
    },
    fn ({ weakPassword } = {}) {
      const userId = this.userId
      if (!userId) { return }
      console.log('[Users] Logged in', { userId })

      if (weakPassword) {
        Users.update({ _id: this.userId }, { $set: {
          weakPassword
        } })

        Events.post('users/loginWithWeakPassword', { userId, weakPassword }, 'warning')
      } else {
        Users.update({ _id: this.userId }, { $unset: {
          weakPassword: 1
        } })
        Events.post('users/login', { userId })
      }

      Users.update({ _id: this.userId }, { $set: {
        lastLoginAt: new Date()
      } })
    }
  })

export const logout = ({ Users }) =>
  action({
    name: 'users/afterLogout',
    args: {
      untrustedUserId: String // For performance, client sends its previous userId after Meteor.logout() call
    },
    allowAnonymous: true,
    fn ({ untrustedUserId }) {
      console.log('[Users] Logged out', { untrustedUserId })
      Events.post('users/logout', { untrustedUserId })
    }
  })
