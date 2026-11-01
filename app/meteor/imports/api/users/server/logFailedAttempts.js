/* global Accounts */
import { Events } from '../../events'

export default () => {
  Accounts.onLoginFailure(async (attempt) => {
    console.log('[Users] Failed login attempt', attempt)

    await Events.insertAsync({
      type: 'users/loginFailed',
      level: 'error',
      createdBy: attempt.user && attempt.user._id,
      createdAt: new Date(),
      payload: attempt
    })
  })
}
