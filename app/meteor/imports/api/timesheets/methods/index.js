import { isTracking } from './isTracking'
import { sum } from './sum'
import { stringify } from './stringify'

export default function ({ Timesheets }) {
  return Object.assign({},
    { isTracking: isTracking({ Timesheets }) },
    { sum: sum({ Timesheets }) },
    { stringify: stringify({ Timesheets }) }
  )
}
