import { Meteor } from 'meteor/meteor'

export default () => {
  if (Meteor.AppCache) {
    Meteor.AppCache.config({
      _disableSizeCheck: true
    })
  }
}
