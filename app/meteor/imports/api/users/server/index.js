import logFailedAttempts from './logFailedAttempts'
import methods from './methods'
import publication from './publication'
import security from './security'

export default function () {
  logFailedAttempts()
  methods()
  publication()
  security()
}
