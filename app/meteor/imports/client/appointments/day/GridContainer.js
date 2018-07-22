import memoize from 'lodash/memoize'
import sortBy from 'lodash/fp/sortBy'
import keyBy from 'lodash/fp/keyBy'
import moment from 'moment'
import { withTracker } from 'meteor/react-meteor-data'
import { __ } from '../../../i18n'
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
    fullNameWithTitle: Users.methods.fullNameWithTitle(user),
    lastName: user.lastName
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

const composer = (props) => {
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
      fullNameWithTitle: __('appointments.unassigned')
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

  setTimeout(() => {
    const appointments = Appointments
      .find(getAppointmentsSelector({ date, calendarId: calendar._id }))
      .fetch()

    appointmentsIndexed = keyBy(appointmentToKey)(appointments)
  }, 10)

  return { columns, rows, slotSize, getAppointment }
}

export const GridContainer = withTracker(composer)(Grid)
