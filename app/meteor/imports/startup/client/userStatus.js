import React from 'react'
import { Icon } from '../../client/components/Icon'
import moment from 'moment-timezone'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { __ } from '../../i18n'

export default () => {
  const connectionStatus = () => {
    Tracker.autorun(() => {
      const messageTimeout = [10, 'seconds']

      try {
        const status = Meteor.status().status
        console.log('[Meteor] status', status)
        console.log('[Meteor] connection', Meteor.connection)

        if (status === 'connected') {
          if (window.offline && window.offline.alertId) {
            console.log('[Meteor] status: connected')
            Alert.close(window.offline.alertId)
            const icon = React.createElement(Icon, { name: 'thumbs-up' }, null)
            Alert.success(__('ui.statusMessages.connected'), { timeout: 2000, customFields: { icon } })
          }
          window.offline = null
        } else {
          if (window.offline) {
            if (!window.offline.alertId && window.offline.since.isBefore(moment().subtract(messageTimeout[0], messageTimeout[1]))) {
              const icon = React.createElement(Icon, { name: 'refresh', spin: true }, null)
              window.offline.alertId = Alert.warning(__('ui.statusMessages.disconnected'), { timeout: 'none', customFields: { icon } })
              console.log('[Meteor] status:', status)
            }
          } else {
            window.offline = {
              since: moment()
            }
          }
        }
      } catch (e) {
        console.error('[Meteor] status: error', e)
      }
    })
  }

  Meteor.setTimeout(connectionStatus, 2500)
}
