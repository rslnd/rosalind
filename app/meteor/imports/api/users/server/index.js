import logFailedAttempts from './logFailedAttempts'
import publication from './publication'
import actions from './actions'

export default function () {
  actions()
  logFailedAttempts()
  publication()
}
