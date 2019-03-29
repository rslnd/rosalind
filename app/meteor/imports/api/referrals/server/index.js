import { publication } from './publication'
import { security } from './security'
import { serverActions } from './serverActions'

export default function () {
  serverActions()
  publication()
  security()
}
