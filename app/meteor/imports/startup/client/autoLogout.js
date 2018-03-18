import { Meteor } from 'meteor/meteor'

export const autoLogout = () => {
  window.addEventListener('beforeunload', function () {
    Meteor.logout()
    window.localStorage.clear()
  })
}
