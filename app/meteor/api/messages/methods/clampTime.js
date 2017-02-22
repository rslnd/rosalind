import { dayTimeFrom, dayTimeTo } from './isQuietTime'
import { skipBackwards, skipForwards } from './skipBackwards'

export const clampTime = (time, { lower = dayTimeFrom, upper = dayTimeTo }) => {
  const m = time.clone()
  const lowerBound = lower(m.clone())
  const upperBound = upper(m.clone())

  if (m.isBefore(lowerBound)) {
    return skipForwards({
      start: m,
      count: 1,
      unit: 'hours',
      skip: (h) => h.isBefore(lowerBound)
    })
  } else if (m.isAfter(upperBound)) {
    return skipBackwards({
      start: m,
      count: 1,
      unit: 'hours',
      skip: (h) => h.isAfter(upperBound)
    })
  } else {
    return time
  }
}
