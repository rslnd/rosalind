import { hasRole } from './hasRole'
import { isTrustedAccessToken } from './withTrustedAccessToken'
import { isLocalhost } from '../../api/customer/isTrustedNetwork'

export const isAllowed = ({ connection, userId, clientKey, accessToken, roles, allowAnonymous, requireClientKey }) => {
  const trustedAccessToken = (accessToken && isTrustedAccessToken(accessToken))

  // Allow trustedAccessTokens from localhost
  if (trustedAccessToken && isLocalhost(connection.clientAddress)) {
    return true
  }

  // Don't preload anything on untrusted networks
  if (!userId && !allowAnonymous) {
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

  if (!client) {
    return false
  }

  if (client.isBanned) {
    return false
  }

  return true
}
