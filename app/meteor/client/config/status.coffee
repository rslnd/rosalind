connectionStatus = ->
  Tracker.autorun ->
    status = Meteor.status().status

    if status is 'connected'
      console.log('[Meteor] status: connected')
      if window.offline?
        sAlert.close(window.offline.alertId)
        html = '<i class="fa fa-thumbs-up"></i> ' + TAPi18n.__('ui.statusMessages.connected')
        sAlert.success(html, { timeout: 2000, html: true })
        window.offline = null

    else
      if status is 'connecting'
        console.log('[Meteor] status: connecting')
      else
        console.log('[Meteor] status: disconnected')

      if window?.offline?.since
        if window.offline.since.isBefore(moment().subtract(1, 'minute'))
          console.log('[Meteor] status: force reloading')
          window.location.reload()
      else if not window.offline?
        html = '<i class="fa fa-refresh fa-spin"> </i> ' + TAPi18n.__('ui.statusMessages.disconnected')
        window.offline =
          since: moment()
          alertId: sAlert.warning(html, { timeout: 'none', html: true })

userStatus = ->
  Tracker.autorun (t) ->
    try
      TimeSync.loggingEnabled = false
      UserStatus.startMonitor
        threshold: 30 * 1000
        idleOnBlur: false

      t.stop()
    catch e
      # noop

Meteor.startup ->
  userStatus
  Meteor.setTimeout(connectionStatus, 2500)
