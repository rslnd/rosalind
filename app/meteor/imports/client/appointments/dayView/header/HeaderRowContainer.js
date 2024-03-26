import { withTracker } from '../../../components/withTracker'
import { __ } from '../../../../i18n'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Schedules } from '../../../../api/schedules'
import { Calendars } from '../../../../api/calendars'
import { Appointments } from '../../../../api/appointments'
import { dateToDay } from '../../../../util/time/day'
import { HeaderRow } from './HeaderRow'
import { hasRole } from '../../../../util/meteor/hasRole'

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

  const onChangeNote = (fields) => {
    Schedules.actions.setNote.callPromise({
      calendarId: fields.calendarId || calendarId,
      day: fields.day || day,
      note: fields.note,
      noteDetails: fields.noteDetails
    }).catch(err => {
      Alert.error(__('ui.error'))
      console.error(err)
    }).then(() => {
      Alert.success(__('ui.saved'))
    })
  }

  const onChangeCalendarNote = (newNote) => {
    Calendars.actions.setNote.callPromise({
      calendarId,
      newNote
    }).catch(err => {
      Alert.error(__('ui.error'))
      console.error(err)
    }).then(() => {
      Alert.success(__('ui.saved'))
    })
  }

  const canEditSchedules = hasRole(Meteor.userId(), ['admin', 'schedules-edit'])

  return {
    ...props,
    onAddUser,
    onRemoveUser,
    onChangeAssignee,
    canEditSchedules,
    onChangeNote,
    onChangeCalendarNote
  }
}

export const HeaderRowContainer = withTracker(composer)(HeaderRow)
