import logFailedAttempts from './logFailedAttempts'
import publication from './publication'
import security from './security'
import actions from './actions'

export default function () {
  actions()
  logFailedAttempts()
  publication()
  security()
}
