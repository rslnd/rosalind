import moment from 'moment'
import 'moment-duration-format'

export const durationFormat = (decimal, unit = 'hours') => (
  moment.duration(decimal, unit).format('h:mm', { trim: false })
)
