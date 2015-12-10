Meteor.startup ->
  Tracker.autorun (t) ->
    try
      TimeSync.loggingEnabled = false
      UserStatus.startMonitor
        threshold: 30 * 1000
        idleOnBlur: false

      t.stop()
    catch e
      # noop
