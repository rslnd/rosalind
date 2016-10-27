React = require 'react'
{ Icon } = require 'client/ui/components/Icon'
moment = require 'moment'
Alert = require('react-s-alert').default
{ Meteor } = require 'meteor/meteor'
{ Tracker } = require 'meteor/tracker'
{ TAPi18n } = require 'meteor/tap:i18n'
{ UserStatus } = require 'meteor/mizzao:user-status'
{ TimeSync } = require 'meteor/mizzao:timesync'

module.exports = ->
  connectionStatus = ->
    Tracker.autorun ->
      messageTimeout = [10, 'seconds']

      try
        status = Meteor.status().status

        if status is 'connected'
          if window.offline?.alertId
            console.log('[Meteor] status: connected')
            Alert.close(window.offline.alertId)
            icon = React.createElement(Icon, { name: 'thumbs-up' }, null)
            Alert.success(TAPi18n.__('ui.statusMessages.connected'), { timeout: 2000, customFields: { icon } })
          window.offline = null

        else
          if window?.offline
            if not window.offline.alertId and window.offline.since.isBefore(moment().subtract(messageTimeout[0], messageTimeout[1]))
              icon = React.createElement(Icon, { name: 'refresh', spin: true }, null)
              window.offline.alertId = Alert.warning(TAPi18n.__('ui.statusMessages.disconnected'), { timeout: 'none', customFields: { icon } })
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
