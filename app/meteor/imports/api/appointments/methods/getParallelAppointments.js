import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'

const moment = extendMoment(momentTz)

export default ({ Appointments }) => {
  const getParallelAppointments = ({ start, end, ...selector }) => {
    const searchRange = moment.range(start, end)

    const parallelAppointments = Appointments.find({
      start: { $gt: moment(start).clone().subtract(2, 'hour').toDate() },
      end: { $lt: moment(end).clone().add(2, 'hour').toDate() },
      ...selector
    }).fetch().filter(a =>
      moment.range(a.start, a.end).overlaps(searchRange)
    )

    return parallelAppointments
  }

  return getParallelAppointments
}
