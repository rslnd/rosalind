import { startTracking } from './startTracking'
import { stopTracking } from './stopTracking'
import { isTracking } from './isTracking'
import { sum } from './sum'

export default function ({ Timesheets }) {
  return Object.assign({},
    { startTracking: startTracking({ Timesheets }) },
    { stopTracking: stopTracking({ Timesheets }) },
    { isTracking: isTracking({ Timesheets }) },
    { sum: sum({ Timesheets }) }
  )
}
