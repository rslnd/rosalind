/* global Accounts */
import { check, Match } from 'meteor/check'
import { isTrustedNetwork } from '../../api/customer/isTrustedNetwork'
import { Users } from '../../api/users'
import { Clients } from '../../api/clients'
import { Meteor } from 'meteor/meteor'

export default () => {
  Accounts.config({
    forbidClientAccountCreation: true,
    loginExpirationInDays: 1,
    bcryptRounds: 11
  })

  Accounts.registerLoginHandler('clientKey passwordless', (loginRequest) => {
    if (loginRequest.passwordless && loginRequest.clientKey) {
      check(loginRequest, {
        user: {
          username: String
        },
        passwordless: true,
        clientKey: String
      })

      const username = loginRequest.user && loginRequest.user.username
      const user = username && Users.findOne({ username: username.toLowerCase() })
      if (user) {
        const userId = user._id
        if (user.services && user.services.passwordless) {
          console.log('[Login] Passwordless login request', { userId })
          return { userId }
        } else {
          console.error('[Login] Passwordless login is disabled', { userId })
          throw new Meteor.Error('passwordless-login-disallowed-for-user', `Passwordless Login not enabled for user ${userId}`)
        }
      } else {
        console.error('[Login] User not found while logging in passwordless with clientKey', { username })
        throw new Meteor.Error(403, 'User not found')
      }
    }
  })

  Accounts.validateLoginAttempt((loginAttempt) => {
    if (!loginAttempt.allowed) { return false }
    const user = loginAttempt.user
    const userId = user._id
    const username = user.username
    const userPasswordlessAllowed = user.services && user.services.passwordless
    const ipAddress = loginAttempt.connection.clientAddress
    const passwordlessAttempt = loginAttempt.methodArguments[0].passwordless
    const clientKey = loginAttempt.methodArguments[0].clientKey

    if (passwordlessAttempt) {
      console.log('[Login] Passwordless login attempt', { userId })
      if (isTrustedNetwork(ipAddress)) {
        if (userPasswordlessAllowed) {
          if (clientKey) {
            const client = Clients.findOne({ clientKey })
            if (client && !client.removed && !client.isBanned) {
              if (client.passwordlessGroupIds) {
                if (client.passwordlessGroupIds.includes(user.groupId)) {
                  console.log('[Login] Allowing passwordless login for', userId)
                  return true
                } else {
                  throw new Meteor.Error('passwordless-client-group-disallowed', 'Group not allowed on this client')
                }
              } else {
                console.log('[Login] Allowing passwordless login for', userId)
                return true
              }
            } else {
              throw new Meteor.Error('passwordless-unknown-client-key', 'Client key not registered or not allowed')
            }
          } else {
            throw new Meteor.Error('passwordless-login-no-client-key', 'Missing client key for passwordless login within trusted network')
          }
        } else {
          console.warn('[Login] Passwordless login not enabled for user', { userId })
          throw new Meteor.Error('passwordless-login-disallowed-for-user', `Passwordless Login not enabled for user ${userId}`)
        }
      } else {
        console.warn('[Login] Passwordless login not allowed for network', { userId })
        throw new Meteor.Error('passwordless-login-disallowed-for-network', `Passwordless Login not allowed for network`)
      }
    } else {
      return loginAttempt.allowed // this just means pass through the value of other handlers
    }
  })
}

// Check allowedClientIds
Accounts.validateLoginAttempt((loginAttempt) => {
  if (!loginAttempt.allowed) { return false }
  if (loginAttempt.type !== 'password') { return loginAttempt.allowed }

  const user = loginAttempt.user
  const connectionId = loginAttempt.connection.id

  if (user.allowedClientIds) {
    const client = Clients.findOne({ connectionId })
    if (client && !client.removed && !client.isBanned) {
      if (user.allowedClientIds.indexOf(client._id) !== -1) {
        return true
      } else {
        throw new Meteor.Error('user-not-allowed-on-client', 'User is restricted to clients, User is not allowed on this client')
      }
    } else {
      throw new Meteor.Error('unknown-client-key', 'User is restricted to clients, Client key not registered on this connection id or client is not allowed')
    }
  } else {
    return loginAttempt.allowed // pass through
  }
})
