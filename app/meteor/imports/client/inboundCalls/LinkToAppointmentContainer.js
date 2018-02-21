import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { TAPi18n } from 'meteor/tap:i18n'
import { Calendars } from '../../api/calendars'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'
import { LinkToAppointmentWrapper } from './LinkToAppointment'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'

const getFormattedAppointmentData = (appointmentId) => {
  if (!appointmentId) { return {} }
  Meteor.subscribe('appointment', appointmentId)
  const appointment = Appointments.findOne({ _id: appointmentId })
  if (appointment) {
    const calendarName = Calendars.findOne(appointment.calendarId).name
    const start = moment(appointment.start)
    const date = start.format(TAPi18n.__('time.dateFormatWeekdayShort'))
    const time = start.format(TAPi18n.__('time.timeFormat'))

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
    return onData(null, { text: TAPi18n.__('inboundCalls.isSmsFromPatient') })
  }

  if (date && !assigneeName) {
    return onData(null, {
      text: TAPi18n.__('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminder'),
      linkText: TAPi18n.__('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminderLinkText', { calendarName, date, time }),
      appointmentId
    })
  }

  if (date && assigneeName) {
    return onData(null, {
      text: TAPi18n.__('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminder'),
      linkText: TAPi18n.__('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminderLinkTextWithAssigneeName', { calendarName, date, time, assigneeName }),
      appointmentId
    })
  }

  onData(null, {})
}

export const LinkToAppointmentContainer = composeWithTracker(composer)(LinkToAppointmentWrapper)
