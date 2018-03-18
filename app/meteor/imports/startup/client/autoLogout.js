import { Meteor } from 'meteor/meteor'

export default () => {
  window.addEventListener('beforeunload', function () {
    // Meteor.logout()
    // window.localStorage.clear()
  })
}
