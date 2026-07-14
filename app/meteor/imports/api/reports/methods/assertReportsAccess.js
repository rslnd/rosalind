import { Meteor } from 'meteor/meteor'
import { hasRole } from '../../../util/meteor/hasRole'
import { isTrustedAccessToken } from '../../../util/meteor/withTrustedAccessToken'
import { isTrustedNetwork, isLocalhost } from '../../customer/isTrustedNetwork'

// Server-side authorization for the report methods. Allows any of:
//   - a user with the 'reports' or 'admin' role
//   - a valid trusted access token from localhost (used by the PDF/e-mail render)
//   - a trusted network (localhost or a configured TENANT_IP)
// Call only on the server (after the isSimulation guard).
export const assertReportsAccess = ({ userId, connection, accessToken }) => {
  if (hasRole(userId, ['reports', 'admin'])) { return }

  if (accessToken && connection &&
    isTrustedAccessToken(accessToken) && isLocalhost(connection.clientAddress)) { return }

  if (connection && isTrustedNetwork(connection.clientAddress)) { return }

  throw new Meteor.Error(403, 'Not authorized')
}
