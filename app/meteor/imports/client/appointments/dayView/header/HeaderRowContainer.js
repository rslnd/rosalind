import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Schedules } from '../../../../api/schedules'
import { Appointments } from '../../../../api/appointments'
import { dateToDay } from '../../../../util/time/day'
import { HeaderRow } from './HeaderRow'

const composer = (props, onData) => {
  const day = dateToDay(props.date)
  const calendarId = props.calendar._id

  const onAddUser = userId => {
    return Schedules.actions.addUserToDay.callPromise({ userId, calendarId, day })
  }

  const onRemoveUser = userId => {
    return Schedules.actions.removeUserFromDay.callPromise({ userId, calendarId, day })
  }

  const onChangeAssignee = ({ oldAssigneeId, newAssigneeId }) => {
    return Appointments.actions.changeAssignee.callPromise({
      day, oldAssigneeId, newAssigneeId, calendarId
    })
  }

  const canEditSchedules = Roles.userIsInRole(Meteor.userId(), ['admin', 'schedules-edit'])

  onData(null, { ...props, onAddUser, onRemoveUser, onChangeAssignee, canEditSchedules })
}

export const HeaderRowContainer = composeWithTracker(composer)(HeaderRow)
