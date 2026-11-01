import { publish } from '../../../util/meteor/publish'
import { Settings } from '../../settings'
import { hasRole } from '../../../util/meteor/hasRole'

export default () => {
  publish({
    name: 'settings',
    allowAnonymous: true,
    fn: async function () {
      if (this.userId && await hasRole(this.userId, [ 'admin', 'settings-edit' ])) {
        return Settings.find({})
      } else {
        return Settings.find({ isPublic: true })
      }
    }
  })
}
