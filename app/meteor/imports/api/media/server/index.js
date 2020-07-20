import { actions } from './actions'
import { publication } from './publication'
import { Media, MediaTags } from '../../'

export default () => {
  actions({ Media, MediaTags })
  publication({ Media, MediaTags })
}
