/* global Accounts */
import { isTrustedNetwork } from 'api/customer/server/isTrustedNetwork'
import { Users } from 'api/users'
import { Meteor } from 'meteor/meteor'

export default () => {
  Accounts.config({
    forbidClientAccountCreation: true,
    loginExpirationInDays: (5 * 365)
  })

  Accounts.registerLoginHandler((loginRequest) => {
    if (loginRequest.passwordless) {
      const username = loginRequest.username
      const user = Users.findOne({ username: username.toLowerCase() })
      if (user) {
        const userId = user._id
        console.log('[Login] Passwordless login request', { userId, username })
        return { userId }
      } else {
        throw new Meteor.Error(403, 'User not found')
      }
    }
  })

  Accounts.validateLoginAttempt((loginAttempt) => {
    if (!loginAttempt.allowed) { return false }
    const user = loginAttempt.user
    const userId = user._id
    const username = user.username
    const userAllowed = user.services.passwordless
    const ipAddress = loginAttempt.connection.clientAddress
    const passwordlessAttempt = loginAttempt.methodArguments[0].passwordless

    if (passwordlessAttempt) {
      console.log('[Login] Passwordless login attempt', { username, userId, ipAddress })
      if (isTrustedNetwork(ipAddress)) {
        if (userAllowed) {
          console.error('[Login] Allowing passwordless login', { username, userId, ipAddress })
          return true
        } else {
          console.warn('[Login] Passwordless login not enabled for user', { username, userId, ipAddress })
          throw new Meteor.Error('passwordless-login-disallowed-for-user', `Passwordless Login not enabled for user ${username}`)
        }
      } else {
        console.warn('[Login] Passwordless login not allowed for network', { username, userId, ipAddress })
        throw new Meteor.Error('passwordless-login-disallowed-for-network', `Passwordless Login not allowed for network ${ipAddress}`)
      }
    } else {
      return loginAttempt.allowed
    }
  })
}
