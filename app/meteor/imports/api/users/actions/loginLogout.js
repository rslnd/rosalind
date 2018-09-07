import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const login = ({ Users }) =>
  action({
    name: 'users/login',
    allowAnonymous: true,
    fn () {
      const userId = this.userId
      if (!userId) { return }
      console.log('[Users] Logged in', { userId })
      Events.post('users/login', { userId })
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
