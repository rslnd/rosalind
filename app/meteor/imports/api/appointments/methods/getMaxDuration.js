import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { Schedules } from '../../schedules'

const moment = extendMoment(momentTz)

export default ({ Appointments }) => {
  const getMaxDuration = ({ time, assigneeId, calendarId }) => {
    const maxDuration = Math.min(
      untilNextAppointment({ time, assigneeId, calendarId }),
      untilNextOverride({ time, assigneeId, calendarId })
    )

    // TODO: Make recipient deal with Infinity
    return maxDuration === Infinity ? null : maxDuration
  }

  const untilNextAppointment = ({ time, assigneeId, calendarId }) => {
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
      return Infinity
    }
  }

  const untilNextOverride = ({ time, assigneeId, calendarId }) => {
    const nextOverrides = Schedules.find({
      type: 'override',
      start: { $gt: time },
      userId: assigneeId,
      calendarId: calendarId
    }, { sort: { start: 1 }, limit: 1 }).fetch()

    if (nextOverrides[0]) {
      return Math.abs(
        moment.range(
          time,
          nextOverrides[0].start
        ).diff('minutes')
      )
    } else {
      return Infinity
    }
  }

  return getMaxDuration
}
