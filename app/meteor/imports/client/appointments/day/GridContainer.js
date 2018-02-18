import memoize from 'lodash/memoize'
import sortBy from 'lodash/fp/sortBy'
import keyBy from 'lodash/fp/keyBy'
import moment from 'moment'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { TAPi18n } from 'meteor/tap:i18n'
import { Appointments } from '../../../api/appointments'
import { Schedules } from '../../../api/schedules'
import { Users } from '../../../api/users'
import { dateToDay } from '../../../util/time/day'
import { label, timeSlots } from '../dayView/grid/timeSlots'
import { Grid } from './Grid'

const sortByLastName = sortBy('lastName')

const getAssignee = memoize(assigneeId => {
  const user = Users.findOne({ _id: assigneeId })
  return {
    assigneeId,
    fullNameWithTitle: user.fullNameWithTitle(),
    lastName: user.profile.lastName
  }
})

const getAppointmentsSelector = ({ date, calendarId }) => ({
  calendarId,
  start: {
    $gt: date.clone().startOf('day').toDate(),
    $lt: date.clone().endOf('day').toDate()
  }
})

const appointmentToKey = appointment => [
  label(moment(appointment.start)),
  appointment.assigneeId
].join('')

const labelsToKey = (startLabel, assigneeId) => [
  startLabel,
  assigneeId
].join('')

const composer = (props, onData) => {
  const { calendar, date } = props

  const daySchedule = Schedules.findOne({
    type: 'day',
    day: dateToDay(date),
    calendarId: calendar._id
  })

  let columns = [
    { type: 'timeLegend' },
    ...daySchedule ? sortByLastName(daySchedule.userIds.map(getAssignee)) : []
  ]

  if (calendar.allowUnassigned) {
    columns.push({
      assigneeId: null,
      type: 'overbooking',
      fullNameWithTitle: TAPi18n.__('appointments.unassigned')
    })
  }

  const slotSize = calendar.slotSize || 5
  const rows = timeSlots(slotSize)

  let appointmentsIndexed = {}

  const getAppointment = (columnIndex, rowIndex) => {
    const assigneeId = columns[columnIndex].assigneeId
    const start = rows[rowIndex]

    return appointmentsIndexed[labelsToKey(start, assigneeId)]
  }

  onData(null, { columns, rows, slotSize, getAppointment })

  const fetchTimeout = setTimeout(() => {
    const appointments = Appointments
      .find(getAppointmentsSelector({ date, calendarId: calendar._id }))
      .fetch()

    appointmentsIndexed = keyBy(appointmentToKey)(appointments)
  }, 10)

  return () => clearTimeout(fetchTimeout)
}

export const GridContainer = composeWithTracker(composer)(Grid)
