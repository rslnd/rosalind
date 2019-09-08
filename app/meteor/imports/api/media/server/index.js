import { actions } from './actions'
import { publication } from './publication'
import { Media } from '../../'

export default () => {
  actions({ Media })
  publication({ Media })
}
