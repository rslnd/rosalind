import moment from 'moment'
import 'moment-duration-format'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'react-komposer'
import { Box } from 'client/ui/components/Box'
import { Icon } from 'client/ui/components/Icon'
import { Timesheets } from 'api/timesheets'

const TimesheetItem = ({ timesheet }) => (
  <span>
    <span>{moment(timesheet.start).format('H:mm')}</span>
    -
    <span>{timesheet.end ? moment(timesheet.end).format('H:mm') : TAPi18n.__('timesheets.now')}</span>
  </span>
)

const TimesheetsScreen = ({ timesheets, sum }) => (
  <div className="content">
    <Box>
      <h3>{TAPi18n.__('timesheets.youHaveWorkedThisMonth', moment.duration(sum).format('H[h] mm[m]'))}</h3>
      {timesheets.map((timesheet) => (
        <p key={timesheet._id}>
          <TimesheetItem timesheet={timesheet} />
        </p>
      ))}
    </Box>
  </div>
)

const composer = (props, onData) => {
  const subscription = Meteor.subscribe('timesheets-month')

  if (subscription.ready()) {
    const userId = Meteor.userId()
    const start = moment().startOf('month')

    const update = () => {
      const timesheets = Timesheets.find({
        userId,
        start: { $gt: start.toDate() }
      }).fetch()
      const isTracking = Timesheets.methods.isTracking({ userId })
      const sum = Timesheets.methods.sum({ userId, start })
      onData(null, { timesheets, isTracking, sum })
    }

    update()
    const tick = setInterval(update, 1000)
    const cleanup = () => clearInterval(tick)
    return cleanup
  }
}

export const TimesheetsContainer = composeWithTracker(composer)(TimesheetsScreen)
