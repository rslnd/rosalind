import { Meteor } from 'meteor/meteor'
import { updateAvailable } from './native/update'

export default () => {
  window.addEventListener('beforeunload', () => {
    if (process.env.NODE_ENV === 'development') {
      return
    }

    // Don't force logout when just restarting app for update
    if (updateAvailable()) {
      return
    }

    Meteor.logout()
    window.localStorage.clear()

    return null
  })
}
