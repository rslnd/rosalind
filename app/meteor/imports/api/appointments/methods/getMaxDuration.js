import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'

const moment = extendMoment(momentTz)

export default ({ Appointments }) => {
  const getMaxDuration = ({ time, assigneeId, calendarId }) => {
    const nextAppointments = Appointments.find({
      start: { $gt: time },
      assigneeId: assigneeId,
      calendarId: calendarId
    }, { sort: { start: 1 }, limit: 1 }).fetch()

    if (nextAppointments[0]) {
      return Math.abs(
        moment.range(
          time,
          nextAppointments[0].start
        ).diff('minutes')
      )
    } else {
      return null
    }
  }

  return getMaxDuration
}
