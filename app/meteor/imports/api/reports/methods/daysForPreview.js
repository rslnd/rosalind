import _moment from 'moment'
import { extendMoment } from 'moment-range'
import { dateToDay } from '../../../util/time/day'
const moment = extendMoment(_moment)

export const daysForPreview = (date, weeks = 3) => {
  const start = moment(date).startOf('week')
  const end = start.clone().add(weeks, 'weeks')
  const range = moment.range(start, end)
  const days = Array.from(range.by('days')).map(t => moment(t))

  return days
    .filter(m => m.day() !== 0)
    .map(dateToDay)
}
