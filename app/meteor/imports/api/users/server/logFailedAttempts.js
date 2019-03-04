import { Events } from '../../events'
import { AccountsCommon } from 'meteor/accounts-base'

export default () => {
  AccountsCommon.onLoginFailure((attempt) => {
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
