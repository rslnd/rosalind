import migrations from './migrations'
import publication from './publication'

export default function () {
  migrations()
  publication()
}
