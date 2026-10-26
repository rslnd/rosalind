import { check } from 'meteor/check'
import { isRoleMatch } from './internal/isRoleMatch'
import union from 'lodash/union'
import difference from 'lodash/difference'
import { Meteor } from 'meteor/meteor'

// Hacky workaround for circular dependencies
let Groups = null

export const effectiveRoles = ({ baseRoles = [], addedRoles = [], removedRoles = [] }) =>
  difference(union(baseRoles, addedRoles), removedRoles)

const validate = (userId, requiredRoles) => {
  check(userId, String)
  check(requiredRoles, [String])
}

const resolve = (user, group, requiredRoles) => {
  if (!user) { return false }

  const baseRoles = group ? group.baseRoles : []

  const userRoles = effectiveRoles({
    baseRoles,
    addedRoles: user.addedRoles,
    removedRoles: user.removedRoles
  })

  if (!userRoles || userRoles.length === 0) {
    return false
  }

  return isRoleMatch({ requiredRoles, userRoles })
}

// Client: synchronous (reactive minimongo) so it can be used directly in trackers
// and render. Server: async (Meteor 3 has no synchronous Mongo on the server);
// server-side callers must `await hasRole(...)`.
export const hasRole = Meteor.isServer
  ? async (userId, requiredRoles) => {
    if (!userId) { return false }
    validate(userId, requiredRoles)
    if (!requiredRoles || requiredRoles.length === 0) { return false }

    const user = await Meteor.users.findOneAsync({ _id: userId })
    if (!user) { return false }

    if (!Groups) { Groups = require('../../api/groups').Groups }
    const group = await Groups.findOneAsync({ _id: user.groupId })

    return resolve(user, group, requiredRoles)
  }
  : (userId, requiredRoles) => {
    if (!userId) { return false }
    validate(userId, requiredRoles)
    if (!requiredRoles || requiredRoles.length === 0) { return false }

    const user = Meteor.users.findOne({ _id: userId })
    if (!user) { return false }

    if (!Groups) { Groups = require('../../api/groups').Groups }
    const group = Groups.findOne({ _id: user.groupId })

    return resolve(user, group, requiredRoles)
  }
