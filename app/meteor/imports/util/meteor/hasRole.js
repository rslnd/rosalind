import { check } from 'meteor/check'
import { isRoleMatch } from './internal/isRoleMatch'
import union from 'lodash/union'
import difference from 'lodash/difference'
import { Meteor } from 'meteor/meteor'

// Hacky workaround for circular dependencies
let Groups = null

export const effectiveRoles = ({ baseRoles = [], addedRoles = [], removedRoles = [] }) =>
  difference(union(baseRoles, addedRoles), removedRoles)

export const hasRole = (userId, requiredRoles) => {
  check(userId, String)
  check(requiredRoles, [String])

  if (!userId) { return false }
  if (!requiredRoles) { return false }
  if (requiredRoles.length === 0) { return false }

  const user = Meteor.users.findOne({ _id: userId })
  if (!user) {
    return false
  }

  if (!Groups) { Groups = require('../../api/groups').Groups }
  const group = Groups.findOne({ _id: user.groupId })
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
