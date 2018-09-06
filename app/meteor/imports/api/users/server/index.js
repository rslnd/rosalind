import logFailedAttempts from './logFailedAttempts'
import methods from './methods'
import publication from './publication'
import security from './security'
import actions from './actions'

export default function () {
  actions()
  logFailedAttempts()
  methods()
  publication()
  security()
}
