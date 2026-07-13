import find from 'lodash/find'
import moment from 'moment-timezone'
import { Calendars } from '../../calendars'
import { Appointments } from '../../appointments'
import { Settings } from '../../settings'
import { Tags } from '../../tags'
import { isMobileNumber } from './isMobileNumber'
import { buildMessageText } from './buildMessageText'
import { reminderDateCalculator } from './reminderDateCalculator'
import { hasRole } from '../../../util/meteor/hasRole'

export const mobilePhone = (contacts = []) => {
  const c = find(contacts, c =>
    (c.channel === 'Phone' &&
    isMobileNumber(c.value))
  )
  return c && c.value
}

// Builds a single `appointmentReminder` message document (without `createdAt`)
// for the given payload, or returns `false` if no reminder should be created
// (calendar disabled, opt-out tag/role, empty text, ...).
//
// Extracted from createReminders so a single appointment's reminder can be
// (re)built on demand, e.g. when an appointment is moved (see
// actions/createReminderForAppointment.js).
export const buildReminderMessage = ({ payload, holidays = [] }) => {
  const calendar = Calendars.findOne({ _id: payload.calendarId })
  if ((calendar && !calendar.smsAppointmentReminder) || !calendar) {
    return false
  }

  const { calculateReminderDate } = reminderDateCalculator({ holidays })

  const tags = Tags.methods.expand(payload.tags)

  let forceSMS = payload.assigneeId
    ? hasRole(payload.assigneeId, ['forceSmsAppointmentReminder'])
    : false

  if (!forceSMS) {
    if (tags.some(t => t.noSmsAppointmentReminder)) {
      return false
    }

    if (payload.assigneeId && hasRole(payload.assigneeId, ['noSmsAppointmentReminder'])) {
      return false
    }
  }

  let text = Settings.get('messages.sms.appointmentReminder.text')

  if (calendar && calendar.smsAppointmentReminderText && calendar.smsAppointmentReminderText.length > 10) {
    text = calendar.smsAppointmentReminderText
  }

  if (payload.gender === 'Male' && calendar && calendar.smsAppointmentReminderTextMale && calendar.smsAppointmentReminderTextMale.length > 10) {
    text = calendar.smsAppointmentReminderTextMale
  }

  // uro11 special: different text if appt is within first hour of day
  if (process.env.CUSTOMER_PREFIX === 'uro11' && Settings.get('messages.sms.appointmentReminder.textFirstHour')) {
    const firstApptOfDay = Appointments.findOne({
      calendarId: payload.calendarId,
      start: {
        $gte: moment(payload.start).startOf('day'),
        $lte: moment(payload.start).startOf('day'),
      }
    }, {
      sort: {
        start: 1
      }
    })

    if (firstApptOfDay) {
      const firstHourFrom = moment(firstApptOfDay.start)
      const firstHourTo = moment(firstApptOfDay.start).add(1, 'hour')

      if (moment(payload.start).isBetween(firstHourFrom, firstHourTo)) {
        text = Settings.get('messages.sms.appointmentReminder.textFirstHour')
      }
    }
  }

  // vasektomie ohne voller blase
  if (process.env.CUSTOMER_PREFIX === 'uro11') {
    const vasec = tags.find(t => t.tag === 'Vasektomie')
    if (vasec && Settings.get('messages.sms.appointmentReminder.textVasectomy')) {
      text = Settings.get('messages.sms.appointmentReminder.textVasectomy')
    }
  }

  // hzw special: different text + time if assignee is telemed
  if (Settings.get('messages.sms.appointmentReminder.telemedicineText')) {
    if (payload.assigneeId && hasRole(payload.assigneeId, ['telemedicine-provider'])) {
      text = Settings.get('messages.sms.appointmentReminder.telemedicineText')
    }
  }

  if (!text) {
    return false
  }

  return {
    type: 'appointmentReminder',
    channel: 'SMS',
    direction: 'outbound',
    status: 'scheduled',
    to: mobilePhone(payload.contacts),
    scheduled: calculateReminderDate(payload.start, calendar.smsDaysBefore || 2).toDate(),
    text: buildMessageText({ text }, {
      date: payload.start
    }),
    invalidBefore: moment(payload.start).subtract(3, 'weeks').toDate(),
    invalidAfter: moment(payload.start).subtract(4, 'hours').toDate(),
    appointmentId: payload.appointmentId,
    patientId: payload.patientId,
    payload
  }
}
