import moment from 'moment-timezone'
import { dayTimeFrom, dayTimeTo } from './isQuietTime'

export const clampTime = (time, { lower = dayTimeFrom, upper = dayTimeTo, pad = 0 }) => {
  const m = time.clone()

  if (m.isBefore(lower(m.clone()))) {
    if (pad) {
      return lower(m.clone()).add(pad, 'minutes')
    } else {
      return lower(m.clone())
    }
  } else if (moment(m).isAfter(upper(moment(m).clone()))) {
    if (pad) {
      return upper(m.clone()).subtract(pad, 'minutes')
    } else {
      return upper(m.clone())
    }
  } else {
    return time
  }
}
