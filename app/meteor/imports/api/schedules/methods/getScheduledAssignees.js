import moment from 'moment-timezone'
import uniq from 'lodash/uniq'
import { daySelector, dayToDate } from '../../../util/time/day'

export default ({ Schedules }) => {
  const getScheduledAssignees = async ({ day, calendarId }) => {
    const daySchedule = await Schedules.findOneAsync({
      type: 'day',
      calendarId,
      ...daySelector(day)
    })

    if (daySchedule) {
      return daySchedule.userIds
    }

    const overrides = await Schedules.find({
      calendarId,
      type: 'override',
      start: {
        $gt: moment(dayToDate(day)).endOf('day').toDate()
      },
      end: {
        $lt: moment(dayToDate(day)).startOf('day').toDate()
      }
    }).fetchAsync()

    if (overrides.length >= 1) {
      return uniq(overrides.map(o => o.userId))
    }
  }

  return getScheduledAssignees
}
