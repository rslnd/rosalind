import moment from 'moment-timezone'
import { __ } from '../../i18n'
import { Calendars } from '../../api/calendars'
import { Appointments } from '../../api/appointments'
import { Users } from '../../api/users'
import { LinkToAppointmentWrapper } from './LinkToAppointment'
import { withTracker } from '../components/withTracker'
import { subscribe } from '../../util/meteor/subscribe'

const getFormattedAppointmentData = (appointmentId) => {
  if (!appointmentId) { return {} }
  const appointment = Appointments.findOne({ _id: appointmentId })
  if (appointment) {
    const calendarName = Calendars.findOne(appointment.calendarId).name
    const start = moment(appointment.start)
    const date = start.format(__('time.dateFormatWeekdayShort'))
    const time = start.format(__('time.timeFormat'))

    if (appointment.assigneeId) {
      const assignee = Users.findOne({ _id: appointmentId }, { removed: true })
      const assigneeName = assignee && Users.methods.fullNameWithTitle(assignee)
      return { calendarName, date, time, assigneeName, patientId: appointment.patientId }
    } else {
      return { calendarName, date, time, patientId: appointment.patientId }
    }
  } else {
    return {}
  }
}

const composer = ({ inboundCall, ...props }) => {
  if (!(inboundCall && (inboundCall.payload || inboundCall.patientId))) {
    return props
  }

  if (inboundCall.payload && (inboundCall.payload.channel !== 'SMS')) {
    return props
  }

  if (inboundCall.payload) {
    const appointmentId = inboundCall.payload.appointmentId
    const { date, time, calendarName, assigneeName, patientId } = getFormattedAppointmentData(appointmentId)

    if (!date && !inboundCall.payload.patientId) {
      return { text: __('inboundCalls.isSmsFromPatient') }
    }

    if (date && !assigneeName) {
      return {
        text: __('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminder'),
        linkText: __('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminderLinkText', { calendarName, date, time }),
        appointmentId,
        patientId,
        ...props
      }
    }

    if (date && assigneeName) {
      return {
        text: __('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminder'),
        linkText: __('inboundCalls.isSmsFromPatientAsReplyToAppointmentReminderLinkTextWithAssigneeName', { calendarName, date, time, assigneeName }),
        appointmentId,
        patientId,
        ...props
      }
    }
  }

  if (inboundCall.patientId) {
    return {
      linkText: __('inboundCalls.patientFile'),
      patientId: inboundCall.patientId,
      ...props
    }
  }

  return props
}

export const LinkToAppointmentContainer = withTracker(composer)(LinkToAppointmentWrapper)
