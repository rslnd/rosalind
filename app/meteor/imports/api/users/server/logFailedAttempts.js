/* global Accounts */
import { Events } from '../../events'

export default () => {
  Accounts.onLoginFailure((attempt) => {
    console.log('[Users] Failed login attempt', attempt)

    Events.insert({
      type: 'users/loginFailed',
      level: 'error',
      createdBy: attempt.user && attempt.user._id,
      createdAt: new Date(),
      payload: attempt
    })
  })
}
