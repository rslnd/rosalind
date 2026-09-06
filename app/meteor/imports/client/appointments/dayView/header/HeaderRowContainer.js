import React from 'react'
import { withTracker } from '../../../components/withTracker'
import { __ } from '../../../../i18n'
import Alert from 'react-s-alert'
import { Meteor } from 'meteor/meteor'
import { Schedules } from '../../../../api/schedules'
import { Calendars } from '../../../../api/calendars'
import { Appointments } from '../../../../api/appointments'
import moment from 'moment-timezone'
import { dateToDay, daySelector } from '../../../../util/time/day'
import { HeaderRow } from './HeaderRow'
import { hasRole } from '../../../../util/meteor/hasRole'
import { subscribe } from '../../../../util/meteor/subscribe'
import { prompt } from '../../../layout/Prompt'

const composer = (props) => {
  const day = dateToDay(props.date)
  const calendarId = props.calendar._id

  // Vacations (per assignee) that overlap the current day. The schedules-day
  // publication already includes type:'vacation' overlapping this day.
  const dayStart = moment(props.date).startOf('day').toDate()
  const dayEnd = moment(props.date).endOf('day').toDate()
  const vacations = Schedules.find({
    type: 'vacation',
    calendarId,
    removed: { $ne: true },
    start: { $lte: dayEnd },
    end: { $gte: dayStart }
  }).fetch()

  // Whether the whole day is marked as closed (holiday).
  const isClosed = Schedules.find({
    type: 'holiday',
    removed: { $ne: true },
    ...daySelector(day)
  }).count() > 0

  // All vacations of the calendar, to highlight already entered vacations in the
  // vacation date picker.
  subscribe('schedules-vacations', { calendarId })
  const allVacations = Schedules.find({
    type: 'vacation',
    calendarId,
    removed: { $ne: true }
  }).fetch()

  const onSaveVacation = ({ scheduleId, userId, start, end, allDay, from, to, reason }) =>
    Schedules.actions.upsertVacation.callPromise({
      scheduleId, calendarId, userId, start, end, allDay, from, to, reason
    }).then(() => Alert.success(__('ui.saved')))
      .catch(err => { Alert.error(__('ui.error')); console.error(err) })

  const onRemoveVacation = (scheduleId) =>
    Schedules.actions.softRemove.callPromise({ scheduleId })
      .then(() => Alert.success(__('ui.deleted')))
      .catch(err => { Alert.error(__('ui.error')); console.error(err) })

  const onSetDayClosed = async (closed) => {
    if (closed) {
      // Confirm before closing, warning about already scheduled appointments.
      const count = Appointments.find({
        calendarId,
        type: { $ne: 'bookable' },
        canceled: { $ne: true },
        removed: { $ne: true },
        start: { $gte: dayStart, $lte: dayEnd }
      }).count()
      const dateStr = moment(props.date).format('dddd, DD.MM.YYYY')
      const apptTxt = count > 0
        ? (count === 1 ? ' Es ist noch 1 Termin vergeben.' : ` Es sind noch ${count} Termine vergeben.`)
        : ''
      const ok = await prompt({
        title: <span style={{ fontSize: 20, fontWeight: 'bold' }}>Praxis schließen</span>,
        body: `Soll die Praxis am ${dateStr} wirklich als geschlossen markiert werden?${apptTxt}`,
        confirm: 'Ja, schließen',
        cancel: 'Abbrechen'
      })
      if (!ok) { return }
    }
    return Schedules.actions.setDayClosed.callPromise({ day, closed })
      .then(() => Alert.success(__('ui.saved')))
      .catch(err => { Alert.error(__('ui.error')); console.error(err) })
  }

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
    onChangeCalendarNote,
    vacations,
    allVacations,
    isClosed,
    onSaveVacation,
    onRemoveVacation,
    onSetDayClosed
  }
}

export const HeaderRowContainer = withTracker(composer)(HeaderRow)
