import moment from 'moment-timezone'
import { __ } from '../../i18n'
import { Calendars } from '../../api/calendars'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'
import { LinkToAppointmentWrapper } from './LinkToAppointment'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { subscribe } from '../../util/meteor/subscribe'

const getFormattedAppointmentData = (appointmentId) => {
  if (!appointmentId) { return {} }
  subscribe('appointment', { appointmentId })
  const appointment = Appointments.findOne({ _id: appointmentId })
  if (appointment) {
    const calendarName = Calendars.findOne(appointment.calendarId).name
    const start = moment(appointment.start)
    const date = start.format(__('time.dateFormatWeekdayShort'))
    const time = start.format(__('time.timeFormat'))

    if (appointment.assigneeId) {
      const assignee = Users.findOne({ _id: appointmentId })
      const assigneeName = assignee && Users.methods.fullNameWithTitle(assignee)
      return { calendarName, date, time, assigneeName }
    } else {
      return { calendarName, date, time }
    }
  } else {
    return {}
  }
}

const composer = ({ inboundCall }, onData) => {
  if (!(inboundCall && inboundCall.payload)) {
    return onData(null, {})
  }

  if (inboundCall.payload.channel !== 'SMS') {
    return onData(null, {})
  }

  const appointmentId = inboundCall.payload.appointmentId

  const { date, time, calendarName, assigneeName } = getFormattedAppointmentData(appointmentId)

  if (!date) {
    return onData(null, { text: __('inboundCalls.isSmsFromPatient') })
  }

  if (date && !assigneeName) {
    return onData(null, {
      text: __('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminder'),
      linkText: __('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminderLinkText', { calendarName, date, time }),
      appointmentId
    })
  }

  if (date && assigneeName) {
    return onData(null, {
      text: __('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminder'),
      linkText: __('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminderLinkTextWithAssigneeName', { calendarName, date, time, assigneeName }),
      appointmentId
    })
  }

  onData(null, {})
}

export const LinkToAppointmentContainer = composeWithTracker(composer)(LinkToAppointmentWrapper)
