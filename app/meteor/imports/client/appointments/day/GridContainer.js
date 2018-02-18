import sortBy from 'lodash/fp/sortBy'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { TAPi18n } from 'meteor/tap:i18n'
import { Schedules } from '../../../api/schedules'
import { Users } from '../../../api/users'
import { dateToDay } from '../../../util/time/day'
import { timeSlots } from '../dayView/grid/timeSlots'
import { Grid } from './Grid'

const sortByLastName = sortBy('lastName')

const composer = (props, onData) => {
  const { calendar, date } = props

  const daySchedule = Schedules.findOne({
    type: 'day',
    day: dateToDay(date),
    calendarId: calendar._id
  })

  let columns = [
    { type: 'timeLegend' },
    ...daySchedule ? sortByLastName(daySchedule.userIds.map(assigneeId => {
      const user = Users.findOne({ _id: assigneeId })
      return {
        assigneeId,
        fullNameWithTitle: user.fullNameWithTitle(),
        lastName: user.profile.lastName
      }
    })) : []
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

  onData(null, { columns, rows, slotSize })
}

export const GridContainer = composeWithTracker(composer)(Grid)
