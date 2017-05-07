import _moment from 'moment'
import { extendMoment } from 'moment-range'

const moment = extendMoment(_moment)

export const getScheduledHours = ({ schedules }) => {
  const blockedDurations = schedules.map((schedule) =>
    moment.range(schedule.start, schedule.end).diff('minutes')
  )

  return blockedDurations.reduce((prev, curr) => ((prev || 0) + curr))
}
