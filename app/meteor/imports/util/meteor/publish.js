import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import {
  isTrustedNetwork as checkTrustedNetwork,
  isLocalhost as checkLocalhost
} from '../../api/customer/server/isTrustedNetwork'
import { Clients } from '../../api/clients'
import { hasRole } from './hasRole'

const wrappedPublication = ({ name, args = {}, roles, preload, fn }) => {
  // if (!roles) {
  //   console.warn('Publication', name, 'is not restricted to any roles')
  // }

  // if (preload) {
  //   console.log('Preload Publication', name)
  // }

  return function (clientArgs = {}) {
    try {
      check(clientArgs, {
        clientKey: Match.Maybe(String),
        ...args
      })
    } catch (e) {
      console.error('Publication', name, 'failed check:', e.name, e.message)
      throw e
    }

    const isAllowed = checkIsAllowed({
      connection: this.connection,
      userId: this.userId,
      clientKey: clientArgs.clientKey,
      roles,
      preload
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

const checkIsAllowed = ({ connection, userId, clientKey, roles, preload }) => {
  const isTrustedNetwork = (connection && checkTrustedNetwork(connection.clientAddress))
  const isLocalhost = (connection && checkLocalhost(connection.clientAddress))

  const isClientKeyValid = checkClientKey(clientKey)

  const isTrusted = (preload && isTrustedNetwork && isClientKeyValid) || isLocalhost

  // Path 1: Allow preload on trusted networks, and always allow localhost
  if (isTrusted) {
    return true
  }

  // Path 2: Don't preload anything on untrusted networks
  if (!userId) {
    return false
  }

  // Path 3: Check for roles
  if (roles && roles.length > 0 && hasRole(userId, [...roles, 'admin'])) {
    return true
  }

  if (!roles) {
    return true
  }

  return false
}

const checkClientKey = (clientKey) => {
  if (!clientKey) {
    return false
  }

  const client = Clients.findOne({ clientKey })

  if (!client || client.isBanned) {
    return false
  }

  return true
}
