import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { Users } from '../../api/users'
import { isRoleMatch } from './internal/isRoleMatch'

export const hasRole = (userId, requiredRoles) => {
  check(userId, String)
  check(requiredRoles, [String])

  if (!userId || !requiredRoles || requiredRoles.length === 0) {
    return false
  }

  // TODO: Replace completely with custom implementation
  // that merges roles from the user's group
  if (Roles.userIsInRole(userId, requiredRoles)) {
    return true
  }

  const user = Users.findOne({ _id: userId })
  if (!user) {
    return false
  }

  const userRoles = user && user.roles && user.roles.__global_roles__
  if (!userRoles) {
    return false
  }

  return isRoleMatch({ requiredRoles, userRoles })
}
