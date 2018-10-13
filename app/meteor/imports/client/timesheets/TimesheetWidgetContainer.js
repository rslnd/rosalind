import React from 'react'
import moment from 'moment-timezone'
import 'moment-duration-format'
import { __ } from '../../i18n'
import { withTracker } from '../components/withTracker'
import Button from 'react-bootstrap/lib/Button'
import { Icon } from 'client/client/components/Icon'
import { Timesheets } from 'api/timesheets'

export const TimesheetWidget = ({ timesheets, isTracking, sum, stopTracking, startTracking }) => (
  <div>
    {
      isTracking
      ? <div>
        <p>{__('timesheets.youAreWorking', moment.duration(sum).format(__('time.durationFormat')))}</p>
        <Button bsStyle='warning' block onClick={stopTracking}>
          <Icon name='pause' />&ensp;
          {__('timesheets.pauseAction')}
        </Button>
      </div>
      : <div>
        <p>{__('timesheets.youHaveWorkedToday', moment.duration(sum).format(__('time.durationFormat')))}</p>
        <Button bsStyle='success' block onClick={startTracking}>
          <Icon name='play' />&ensp;
          {__('timesheets.resumeAction')}
        </Button>
      </div>
    }
  </div>
)

const composer = (props) => {
  const { userId } = props
  const stopTracking = () => Timesheets.actions.stopTracking.call()
  const startTracking = () => Timesheets.actions.startTracking.call()

  const timesheets = Timesheets.find({
    userId,
    start: { $gt: moment().startOf('day').toDate() }
  }).fetch()
  const isTracking = Timesheets.methods.isTracking({ userId })
  const sum = Timesheets.methods.sum({ userId })
  return { timesheets, isTracking, sum, stopTracking, startTracking }
}

export const TimesheetWidgetContainer = withTracker(composer)(TimesheetWidget)
