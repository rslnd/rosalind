import moment from 'moment-timezone'
import { Calendars } from '../../calendars'
import { Tags } from '../../tags'
import { Appointments } from '../../appointments'
import { Constraints } from '../../constraints'
import { dayToDate } from '../../../util/time/day'
import { overridesToColumns } from './overridesToColumns'

export default ({ Schedules }) => {
  const getColumns = async ({ day, calendarId }) => {
    const calendar = await Calendars.findOneAsync({ _id: calendarId })
    const assigneeIds = await Schedules.methods.getScheduledAssignees({ day, calendarId })
    if (!assigneeIds || assigneeIds.length === 0) { return [] }

    const startOfDay = moment(dayToDate(day)).startOf('day').toDate()
    const endOfDay = moment(dayToDate(day)).endOf('day').toDate()

    const overrides = await Schedules.find({
      calendarId,
      type: 'override',
      start: {
        $gte: startOfDay
      },
      end: {
        $lte: endOfDay
      }
    }).fetchAsync()

    const appointments = await Appointments.find({
      calendarId,
      start: {
        $gte: startOfDay
      },
      end: {
        $lte: endOfDay
      }
    }).fetchAsync()

    const constraints = (await Constraints.find({
      calendarId
    }).fetchAsync()).filter(c => assigneeIds.some(a => c.assigneeIds.includes(a)))

    const tags = await Tags.find({}).fetchAsync()

    return overridesToColumns({ day, calendar, overrides, constraints, appointments, tags })
  }

  return getColumns
}
