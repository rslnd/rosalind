import { composeWithTracker } from 'react-komposer'
import { Timesheets } from 'api/timesheets'

export const TimesheetIndicator = ({ isTracking, sum }) => (
  <span>
    {
      isTracking
      ? <i className="circle bg-green"></i>
      : (
        sum > 0
        ? <i className="circle bg-yellow"></i>
        : <i className="circle bg-default"></i>
      )
    }
  </span>
)

const composer = (props, onData) => {
  const userId = props.userId

  const isTracking = Timesheets.methods.isTracking.call({ userId })
  const sum = Timesheets.methods.sum.call({ userId })

  onData(null, { isTracking, sum })
}

export const TimesheetIndicatorContainer = composeWithTracker(composer)(TimesheetIndicator)
