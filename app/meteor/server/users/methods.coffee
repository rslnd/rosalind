Meteor.methods
  'users/login': ->
    return unless userId = Meteor.userId()
    console.log('[Users] Logged in', { userId })
    Events.insert
      type: 'users/login'
      payload: { userId }

    Timesheets.startTracking({ userId })



  'users/logout': ->
    return unless userId = Meteor.userId()
    console.log('[Users] Logged out', { userId })
    Events.insert
      type: 'users/logout'
      payload: { userId }

    Timesheets.stopTracking({ userId })
