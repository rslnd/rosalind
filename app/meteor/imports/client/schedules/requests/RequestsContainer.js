import moment from 'moment-timezone'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { __ } from '../../../i18n'
import { Schedules } from '../../../api/schedules'
import { RequestsScreen } from './RequestsScreen'
import { withTracker } from '../../components/withTracker'
import { subscribe } from '../../../util/meteor/subscribe'

const composer = (props) => {
  const handle = subscribe('schedules')
  if (handle.ready()) {
    let selector = {
      requestedAt: { $ne: null },
      $or: [
        { end: { $gt: moment().endOf('day').toDate() } },
        { resolvedAt: null }
      ]
    }

    const requests = Schedules.find(selector, { sort: { start: -1 } }).fetch()
    const approve = (_id) => Schedules.actions.approveRequest.callPromise({ scheduleId: _id }).then(() => {
      Alert.success(__('schedules.requests.acceptSuccess'))
    })

    const decline = (_id) => Schedules.actions.declineRequest.callPromise({ scheduleId: _id }).then(() => {
      Alert.success(__('schedules.requests.declineSuccess'))
    })

    const canEdit = Roles.userIsInRole(Meteor.userId(), ['schedules-edit', 'admin'])

    return { requests, approve, decline, canEdit }
  } else {
    return {
      isLoading: true
    }
  }
}

export const RequestsContainer = withTracker(composer)(RequestsScreen)
