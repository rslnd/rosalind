import { action, Match } from '../../../util/meteor/action'
import { Events } from '../../events'

export const login = ({ Users }) =>
  action({
    name: 'users/login',
    allowAnonymous: true,
    args: {
      weakPassword: Match.Maybe(Match.OneOf(Boolean, Number))
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
    name: 'users/logout',
    allowAnonymous: true,
    fn () {
      const userId = this.userId
      if (!userId) { return }
      console.log('[Users] Logged out', { userId })
      Events.post('users/logout', { userId })
    }
  })
