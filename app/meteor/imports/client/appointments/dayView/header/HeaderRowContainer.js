import { withTracker } from 'meteor/react-meteor-data'
import { __ } from '../../../../i18n'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { Schedules } from '../../../../api/schedules'
import { Appointments } from '../../../../api/appointments'
import { dateToDay } from '../../../../util/time/day'
import { HeaderRow } from './HeaderRow'

const composer = (props) => {
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

  const onChangeNote = ({ ...fields }) => {
    Schedules.actions.setNote.callPromise({
      calendarId,
      day,
      ...fields
    }).catch(err => {
      Alert.error(__('ui.error'))
      console.error(err)
    }).then(() => {
      Alert.success(__('ui.saved'))
    })
  }

  const canEditSchedules = Roles.userIsInRole(Meteor.userId(), ['admin', 'schedules-edit'])

  return { ...props, onAddUser, onRemoveUser, onChangeAssignee, canEditSchedules, onChangeNote }
}

export const HeaderRowContainer = withTracker(composer)(HeaderRow)
