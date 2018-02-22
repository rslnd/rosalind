import { publication } from './publication'
import { serverActions } from './serverActions'

export default function () {
  serverActions()
  publication()
}
