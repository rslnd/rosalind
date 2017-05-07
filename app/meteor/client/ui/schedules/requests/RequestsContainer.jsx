import moment from 'moment-timezone'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { TAPi18n } from 'meteor/tap:i18n'
import { Schedules } from 'api/schedules'
import { Loading } from 'client/ui/components/Loading'
import { RequestsScreen } from './RequestsScreen'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'

const composer = (props, onData) => {
  const handle = Meteor.subscribe('schedules')
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
      Alert.success(TAPi18n.__('schedules.requests.acceptSuccess'))
    })

    const decline = (_id) => Schedules.actions.declineRequest.callPromise({ scheduleId: _id }).then(() => {
      Alert.success(TAPi18n.__('schedules.requests.declineSuccess'))
    })

    const canEdit = Roles.userIsInRole(Meteor.userId(), ['schedules-edit', 'admin'])

    onData(null, { requests, approve, decline, canEdit })
  }
}

export const RequestsContainer = composeWithTracker(composer, Loading)(RequestsScreen)
