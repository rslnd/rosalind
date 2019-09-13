import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { isLocalhost } from '../../api/customer/server/isTrustedNetwork'
import { hasRole } from './hasRole'
import { isTrustedAccessToken } from './withTrustedAccessToken'

const wrappedPublication = ({ name, args = {}, roles, fn, allowAnonymous, requireClientKey }) => {
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
      allowAnonymous,
      requireClientKey,
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

const checkIsAllowed = ({ connection, userId, clientKey, accessToken, roles, allowAnonymous, requireClientKey }) => {
  const trustedAccessToken = (accessToken && isTrustedAccessToken(accessToken))

  // Allow trustedAccessTokens from localhost
  if (trustedAccessToken && isLocalhost(connection.clientAddress)) {
    return true
  }

  // Don't preload anything on untrusted networks
  if (!userId && !allowAnonymous) {
    console.log('failed because missing userid')
    return false
  }

  if (requireClientKey && !checkClientKey(clientKey)) {
    console.log('failed because client key')
    return false
  }

  // Check for roles
  if (roles && roles.length > 0 && hasRole(userId, [...roles, 'admin'])) {
    return true
  }

  if (!roles) {
    return true
  }

  if (allowAnonymous) {
    return true
  }

  return false
}

// Avoid import loop
let Clients = null
const checkClientKey = (clientKey) => {
  if (!clientKey) {
    return false
  }

  if (!Clients) {
    Clients = require('../../api/clients').Clients
  }

  const client = Clients.findOne({ clientKey })

  if (!client || client.isBanned) {
    return false
  }

  return true
}
