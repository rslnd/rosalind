import hooks from './hooks'
import methods from './methods'
import publication from './publication'
import security from './security'
import '../table'

export default function () {
  hooks()
  methods()
  publication()
  security()
}
