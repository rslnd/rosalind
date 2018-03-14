import hooks from './hooks'
import methods from './methods'
import publication from './publication'
import security from './security'

export default function () {
  hooks()
  methods()
  publication()
  security()
}
