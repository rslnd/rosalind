import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import {
  isTrustedNetwork as checkTrustedNetwork,
  isLocalhost as checkLocalhost
} from '../../api/customer/server/isTrustedNetwork'

const wrappedPublication = ({ name, args = {}, roles, preload, fn }) => {
  // if (!roles) {
  //   console.warn('Publication', name, 'is not restricted to any roles')
  // }

  // if (preload) {
  //   console.log('Preload Publication', name)
  // }

  return function (clientArgs) {
    try {
      check(clientArgs, {
        clientKey: Match.Optional(String),
        ...args
      })
    } catch (e) {
      console.error('Publication', name, 'failed check')
      throw e
    }

    const isAllowed = checkIsAllowed({
      connection: this.connection,
      userId: this.userId,
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

// Legacy wrapper for aldeed:tabular
export const publishCompositeTable = options =>
  Meteor.publishComposite(options.name, function (tableName, ids, fields) {
    check(tableName, String)
    check(ids, Array)
    check(fields, Match.Optional(Object))

    return wrappedPublication(options).call(this, { ids })
  })

const checkIsAllowed = ({ connection, userId, roles, preload }) => {
  const isTrustedNetwork = (connection && checkTrustedNetwork(connection.clientAddress))
  const isLocalhost = (connection && checkLocalhost(connection.clientAddress))

  // TODO: Implement client key check
  const isClientKeyValid = true

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
  if (roles && roles.length > 0 && Roles.userIsInRole(userId, [...roles, 'admin'])) {
    return true
  }

  if (!roles) {
    return true
  }

  return false
}
