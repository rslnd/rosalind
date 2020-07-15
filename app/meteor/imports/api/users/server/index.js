import logFailedAttempts from './logFailedAttempts'
import autoLogoutServer from './autoLogoutServer'
import publication from './publication'
import actions from './actions'

export default function () {
  actions()
  logFailedAttempts()
  publication()
  autoLogoutServer()
}
