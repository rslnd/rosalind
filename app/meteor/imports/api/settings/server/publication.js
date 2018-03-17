import { publish } from '../../../util/meteor/publish'
import { Roles } from 'meteor/alanning:roles'
import { Settings } from '../../settings'

export default () => {
  publish({
    name: 'settings',
    preload: true,
    fn: function () {
      if (this.userId && Roles.userIsInRole(this.userId, [ 'admin', 'settings-edit' ])) {
        return Settings.find({})
      } else {
        return Settings.find({ isPublic: true })
      }
    }
  })
}
