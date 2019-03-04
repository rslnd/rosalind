import moment from 'moment-timezone'
import { Calendars } from '../../calendars'
import { Tags } from '../../tags'
import { Appointments } from '../../appointments'
import { Constraints } from '../../constraints'
import { dayToDate } from '../../../util/time/day'
import { overridesToColumns } from './overridesToColumns'

export default ({ Schedules }) => {
  const getColumns = ({ day, calendarId }) => {
    const calendar = Calendars.findOne({ _id: calendarId })
    const assigneeIds = Schedules.methods.getScheduledAssignees({ day, calendarId })
    if (!assigneeIds || assigneeIds.length === 0) { return [] }

    const startOfDay = moment(dayToDate(day)).startOf('day').toDate()
    const endOfDay = moment(dayToDate(day)).endOf('day').toDate()

    const overrides = Schedules.find({
      calendarId,
      type: 'override',
      start: {
        $gte: startOfDay
      },
      end: {
        $lte: endOfDay
      }
    }).fetch()

    const appointments = Appointments.find({
      calendarId,
      start: {
        $gte: startOfDay
      },
      end: {
        $lte: endOfDay
      }
    }).fetch()

    const constraints = Constraints.find({
      calendarId
    }).fetch().filter(c => assigneeIds.some(a => c.assigneeIds.includes(a)))

    const tags = Tags.find({}).fetch()

    console.log(overrides.length, 'Overrides - ', appointments.length, 'Appointments - ', constraints.length, 'Constraints')

    return overridesToColumns({ day, calendar, overrides, constraints, appointments, tags })
  }

  return getColumns
}
