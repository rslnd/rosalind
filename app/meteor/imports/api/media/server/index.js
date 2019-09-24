import { actions } from './actions'
import { publication } from './publication'
import { Media, MediaTags } from '../../'

export default () => {
  actions({ Media })
  publication({ Media, MediaTags })
}
