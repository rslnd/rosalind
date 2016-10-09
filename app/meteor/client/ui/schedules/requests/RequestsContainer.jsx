import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { sAlert } from 'meteor/juliancwirko:s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { Schedules } from 'api/schedules'
import { Loading } from 'client/ui/components/Loading'
import { RequestsScreen } from './RequestsScreen'
import { composeWithTracker } from 'react-komposer'

const composer = (props, onData) => {
  const handle = Meteor.subscribe('schedules')
  if (handle.ready()) {
    const selector = {
      requestedAt: { $ne: null },
      $or: [
        { end: { $gt: moment().startOf('day').subtract(30, 'days').toDate() } },
        { resolvedAt: null }
      ]
    }
    const requests = Schedules.find(selector, { sort: { start: -1 } }).fetch()
    const approve = (_id) => Schedules.actions.approveRequest.callPromise({ scheduleId: _id }).then(() => {
      sAlert.success(TAPi18n.__('schedules.requests.acceptSuccess'))
    })

    const decline = (_id) => Schedules.actions.declineRequest.callPromise({ scheduleId: _id }).then(() => {
      sAlert.success(TAPi18n.__('schedules.requests.declineSuccess'))
    })

    onData(null, { requests, approve, decline })
  }
}

export const RequestsContainer = composeWithTracker(composer, Loading)(RequestsScreen)
