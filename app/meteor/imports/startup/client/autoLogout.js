// import { Meteor } from 'meteor/meteor'

// TODO: Auto logout on browser close
export default () => {
  window.addEventListener('beforeunload', function () {
    // Meteor.logout()
    // window.localStorage.clear()
  })
}
