import migrations from './migrations'
import hooks from './hooks'
import methods from './methods'
import publication from './publication'
import security from './security'

export default function () {
  migrations()
  hooks()
  methods()
  publication()
  security()
}
