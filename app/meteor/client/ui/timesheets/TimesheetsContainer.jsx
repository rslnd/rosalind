import moment from 'moment'
import 'moment-duration-format'
import { Meteor } from 'meteor/meteor'
import { composeWithTracker } from 'react-komposer'
import { Loading } from 'client/ui/components/Loading'
import { Timesheets } from 'api/timesheets'
import { TimesheetsScreen } from './TimesheetsScreen'

const parseDateRange = (dateRange) => {
  const date = dateRange ? moment(dateRange, 'YYYY-MM-DD') : moment()
  return {
    start: date.clone().startOf('month'),
    end: date.clone().endOf('month')
  }
}

const composer = (props, onData) => {
  const { start, end } = parseDateRange(props && props.dateRange)
  const subscription = Meteor.subscribe('timesheets-month')

  if (subscription.ready()) {
    const userId = Meteor.userId()

    const update = () => {
      const timesheets = Timesheets.find({
        userId,
        start: { $gt: start.toDate() }
      }, {
        sort: { start: -1 }
      }).fetch()
      const isTracking = Timesheets.methods.isTracking({ userId })
      const sum = Timesheets.methods.sum({ userId, start })
      onData(null, { timesheets, isTracking, sum, start, end })
    }

    update()
    const tick = setInterval(update, 1000)
    const cleanup = () => clearInterval(tick)
    return cleanup
  }
}

export const TimesheetsContainer = composeWithTracker(composer, Loading)(TimesheetsScreen)
