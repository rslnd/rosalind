import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { isLocalhost } from '../../api/customer/server/isTrustedNetwork'
import { hasRole } from './hasRole'
import { isTrustedAccessToken } from './withTrustedAccessToken'

const wrappedPublication = ({ name, args = {}, roles, fn }) => {
  // if (!roles) {
  //   console.warn('Publication', name, 'is not restricted to any roles')
  // }

  return function (clientArgs = {}) {
    try {
      check(clientArgs, {
        clientKey: Match.Maybe(String),
        accessToken: Match.Maybe(String),
        ...args
      })
    } catch (e) {
      console.error('Publication', name, 'was called with clientArgs', clientArgs, 'that failed check:', e.name, e.message)
      throw e
    }

    const isAllowed = checkIsAllowed({
      connection: this.connection,
      userId: this.userId,
      clientKey: clientArgs.clientKey,
      accessToken: clientArgs.accessToken,
      roles
    })

    if (isAllowed) {
      return fn.call(this, clientArgs)
    } else {
      return undefined
    }
  }
}

export const publishComposite = options =>
  Meteor.publishComposite(options.name, wrappedPublication(options))

export const publish = options =>
  Meteor.publish(options.name, wrappedPublication(options))

const checkIsAllowed = ({ connection, userId, clientKey, accessToken, roles }) => {
  const trustedAccessToken = (accessToken && isTrustedAccessToken(accessToken))

  // Allow trustedAccessTokens from localhost
  if (trustedAccessToken && isLocalhost(connection.clientAddress)) {
    return true
  }

  // Don't preload anything on untrusted networks
  if (!userId) {
    return false
  }

  // Check for roles
  if (roles && roles.length > 0 && hasRole(userId, [...roles, 'admin'])) {
    return true
  }

  if (!roles) {
    return true
  }

  return false
}

// TODO: Maybe restrict publications to those authenticated with a clientKey?
// const checkClientKey = (clientKey) => {
//   if (!clientKey) {
//     return false
//   }

//   const client = Clients.findOne({ clientKey })

//   if (!client || client.isBanned) {
//     return false
//   }

//   return true
// }
