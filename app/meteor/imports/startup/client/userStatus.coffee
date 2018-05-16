import React from 'react'
import { Icon } from '../../client/components/Icon'
import moment from 'moment-timezone'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { __ } from '../../i18n'

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
            Alert.success(__('ui.statusMessages.connected'), { timeout: 2000, customFields: { icon } })
          window.offline = null

        else
          if window?.offline
            if not window.offline.alertId and window.offline.since.isBefore(moment().subtract(messageTimeout[0], messageTimeout[1]))
              icon = React.createElement(Icon, { name: 'refresh', spin: true }, null)
              window.offline.alertId = Alert.warning(__('ui.statusMessages.disconnected'), { timeout: 'none', customFields: { icon } })
              console.log('[Meteor] status:', status)

          else if not window.offline?
            window.offline =
              since: moment()

      catch e
        console.error('[Meteor] status: error', e)

  Meteor.setTimeout(connectionStatus, 2500)
