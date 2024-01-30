import moment from 'moment-timezone'
import 'moment-duration-format'

export const durationFormat = (decimal, unit = 'hours') => (
  (decimal < 0)
    ? '0:00'
    : moment.duration(decimal, unit).format('h:mm', { trim: false })
)
