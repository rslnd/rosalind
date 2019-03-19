export const isRoleMatch = ({ requiredRoles, userRoles }) =>
  (requiredRoles.length === 1 && requiredRoles[0] === '*' && userRoles.length >= 1) ||
  requiredRoles.some(requiredRole => {
    if (requiredRole.indexOf('-*') !== -1) {
      return userRoles.some(userRole => {
        const requiredRolePrefix = requiredRole.substr(0, requiredRole.length - '-*'.length)
        return userRole.indexOf(requiredRolePrefix) === 0
      })
    } else {
      return (userRoles.indexOf(requiredRole) !== -1)
    }
  })
