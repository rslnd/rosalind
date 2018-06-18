import React from 'react'
import moment from 'moment-timezone'
import 'moment-duration-format'
import { TAPi18n } from 'meteor/tap:i18n'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Button } from 'react-bootstrap'
import { Icon } from 'client/client/components/Icon'
import { Timesheets } from 'api/timesheets'

export const TimesheetWidget = ({ timesheets, isTracking, sum, stopTracking, startTracking }) => (
  <div>
    {
      isTracking
      ? <div>
        <p>{TAPi18n.__('timesheets.youAreWorking', moment.duration(sum).format(TAPi18n.__('time.durationFormat')))}</p>
        <Button bsStyle='warning' block onClick={stopTracking}>
          <Icon name='pause' />&ensp;
          {TAPi18n.__('timesheets.pauseAction')}
        </Button>
      </div>
      : <div>
        <p>{TAPi18n.__('timesheets.youHaveWorkedToday', moment.duration(sum).format(TAPi18n.__('time.durationFormat')))}</p>
        <Button bsStyle='success' block onClick={startTracking}>
          <Icon name='play' />&ensp;
          {TAPi18n.__('timesheets.resumeAction')}
        </Button>
      </div>
    }
  </div>
)

const composer = (props, onData) => {
  const { userId } = props
  const stopTracking = () => Timesheets.actions.stopTracking.call()
  const startTracking = () => Timesheets.actions.startTracking.call()

  const update = () => {
    const timesheets = Timesheets.find({
      userId,
      start: { $gt: moment().startOf('day').toDate() }
    }).fetch()
    const isTracking = Timesheets.methods.isTracking({ userId })
    const sum = Timesheets.methods.sum({ userId })
    onData(null, { timesheets, isTracking, sum, stopTracking, startTracking })
  }

  update()
  const tick = setInterval(update, 1000)
  const cleanup = () => clearInterval(tick)
  return cleanup
}

export const TimesheetWidgetContainer = composeWithTracker(composer)(TimesheetWidget)
