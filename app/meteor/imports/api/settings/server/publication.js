import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Settings } from '../../settings'

export default () => {
  Meteor.publish('settings', function () {
    if (this.userId && Roles.userIsInRole(this.userId, [ 'admin', 'settings-edit' ])) {
      return Settings.find({})
    } else {
      return Settings.find({ isPublic: true })
    }
  })
}
