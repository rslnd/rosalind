import migrations from './migrations'
import { publication } from './publication'
import './actions'

export default function () {
  migrations()
  publication()
}
