moment = require 'moment'
{ Meteor } = require 'meteor/meteor'
{ Tracker } = require 'meteor/tracker'
{ sAlert } = require 'meteor/juliancwirko:s-alert'
{ TAPi18n } = require 'meteor/tap:i18n'
{ UserStatus } = require 'meteor/mizzao:user-status'
{ TimeSync } = require 'meteor/mizzao:timesync'

module.exports = ->
  connectionStatus = ->
    Tracker.autorun ->

      forceReloadTimeout = [6, 'minutes']
      messageTimeout = [5, 'seconds']

      try
        status = Meteor.status().status

        if status is 'connected'
          if window.offline?.alertId
            console.log('[Meteor] status: connected')
            sAlert.close(window.offline.alertId)
            html = '<i class="fa fa-thumbs-up"></i> ' + TAPi18n.__('ui.statusMessages.connected')
            sAlert.success(html, { timeout: 2000, html: true })
          window.offline = null

        else
          if window?.offline?.since
            if window.offline.since.isBefore(moment().subtract(forceReloadTimeout[0], forceReloadTimeout[1]))
              console.log('[Meteor] status: force reloading')
              window.location.reload()

            if not window.offline.alertId and window.offline.since.isBefore(moment().subtract(messageTimeout[0], messageTimeout[1]))
              html = '<i class="fa fa-refresh fa-spin"> </i> ' + TAPi18n.__('ui.statusMessages.disconnected')
              window.offline.alertId = sAlert.warning(html, { timeout: 'none', html: true })
              console.log('[Meteor] status:', status)

          else if not window.offline?
            window.offline =
              since: moment()

      catch e
        console.error('[Meteor] status: error', e)

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

  userStatus()
  Meteor.setTimeout(connectionStatus, 2500)
