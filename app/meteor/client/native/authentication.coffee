return unless @native

Meteor.startup =>

  loggedIn = false
  lastUser = null

  Tracker.autorun =>
    currentUser = Meteor.user()

    if currentUser
      @native.authentication.onLogin(currentUser) unless loggedIn
      loggedIn = true
      lastUser = currentUser
    else if lastUser
      @native.authentication.onLogout(lastUser)
      loggedIn = false
      lastUser = null
