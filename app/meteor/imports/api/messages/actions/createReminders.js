import some from 'lodash/some'
import find from 'lodash/find'
import uniqBy from 'lodash/uniqBy'
import identity from 'lodash/identity'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from '../../events'
import { Calendars } from '../../calendars'
import { Appointments } from '../../appointments'
import { Patients } from '../../patients'
import { Users } from '../../users'
import { Tags } from '../../tags'
import { Schedules } from '../../schedules'
import { Settings } from '../../settings'
import { isMobileNumber } from '../methods/isMobileNumber'
import { buildMessageText } from '../methods/buildMessageText'
import { reminderDateCalculator } from '../methods/reminderDateCalculator'
import { hasRole } from '../../../util/meteor/hasRole'

// Don't immediately send out reminder if appointment is very soon,
// We don't want the patient to receive the reminder while still
// on the phone with the clinic.
export const waitMinutesAfterNewAppointment = 120

// TODO: Replace with GraphQL
export const findUpcomingAppointments = (cutoffDate) => {
  // It's important not to use a closing-sliding window here, as
  // that could lead to two reminders being sent out for
  // back-to-back appointments for the same patient
  const start = {
    $gt: cutoffDate.clone().startOf('day').toDate(),
    $lt: cutoffDate.endOf('day').toDate()
  }

  const selector = {
    start,
    createdAt: { $lt: moment.tz(process.env.TZ_CLIENT).subtract(waitMinutesAfterNewAppointment, 'minutes').toDate() },
    removed: { $ne: true },
    canceled: { $ne: true }
  }

  const appointments = Appointments.find(selector, {
    sort: {
      start: 1
    }
  }).fetch()

  return appointments.map((appointment) => {
    let patient, contacts

    if (appointment.patientId) {
      patient = Patients.findOne({ _id: appointment.patientId })
      if (patient && patient.contacts) {
        contacts = patient.contacts
      }
    }

    const assignee = appointment.assigneeId && Users.findOne({ _id: appointment.assigneeId })

    let result = {
      _id: appointment._id,
      assigneeId: assignee && appointment.assigneeId,
      start: appointment.start,
      calendarId: appointment.calendarId
    }

    if (patient) {
      result.patient = {
        _id: patient._id,
        lastName: patient && patient.lastName,
        prefix: patient && Patients.methods.prefix(patient),
        gender: patient && patient.gender
      }

      if (contacts) {
        result.patient.contacts = contacts
      }
    }

    return result
  })
}

export const isSameMessage = (a, b) => {
  return (
    (a.text === b.text) &&
    (a.to === b.to)
  )
}

export const createReminders = ({ Messages }) => {
  return new ValidatedMethod({
    name: 'messages/createReminders',
    mixins: [CallPromiseMixin],
    validate: () => {},
    run () {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!Settings.get('messages.sms.enabled')) { return }

      const holidays = Schedules.find({
        type: 'holiday',
        removed: { $ne: true }
      }).fetch()

      const mobilePhone = contacts =>
        find(contacts, c =>
          (c.channel === 'Phone' &&
          isMobileNumber(c.value))
        ).value

      Calendars.find({ smsAppointmentReminder: true }).fetch().map(calendar => {
        const calendarId = calendar._id

        const { calculateReminderDate, calculateFutureCutoff } = reminderDateCalculator({
          holidays,
          days: (calendar.smsDaysBefore || 2)
        })

        const cutoffDate = calculateFutureCutoff(moment.tz(process.env.TZ_CLIENT))
        const appointments = findUpcomingAppointments(cutoffDate)
        const appointmentsWithMobile = appointments.filter((a) => {
          if (a.patient && a.patient.noSMS) {
            return false
          }

          if (a.patient && a.patient.contacts) {
            return !!mobilePhone(a.patient.contacts)
          }
        })
        const uniqueAppointmentsWithMobile = uniqBy(appointmentsWithMobile, (a) => (
          a.patient.contacts[0].value
        ))

        let insertedCount = 0
        const messagePayloads = uniqueAppointmentsWithMobile.map((a) => {
          return {
            appointmentId: a._id,
            tags: a.tags,
            calendarId: a.calendarId,
            assigneeId: a.assigneeId,
            patientId: a.patient._id,
            start: a.start,
            lastName: a.patient.lastName,
            prefix: a.patient.prefix,
            gender: a.patient.gender,
            contacts: a.patient.contacts
          }
        })

        const messages = messagePayloads.map((payload) => {
          const calendar = Calendars.findOne({ _id: payload.calendarId })
          if ((calendar && !calendar.smsAppointmentReminder) || !calendar) {
            return false
          }

          const tags = Tags.methods.expand(payload.tags)
          if (tags.some(t => t.noSmsAppointmentReminder)) {
            return false
          }

          if (payload.assigneeId && hasRole(payload.assigneeId, ['noSmsAppointmentReminder'])) {
            return false
          }

          const text =
            (calendar && calendar.smsAppointmentReminderText) ||
            Settings.get('messages.sms.appointmentReminder.text')

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
            invalidAfter: moment(payload.start).startOf('day').subtract(12, 'hours').toDate(),
            appointmentId: payload.appointmentId,
            patientId: payload.patientId,
            payload
          }
        }).filter(identity)

        messages.map((message) => {
          const existingMessage = Messages.findOne({
            appointmentId: message.appointmentId,
            removed: { $ne: true }
          })

          if (existingMessage) {
            if (!isSameMessage(existingMessage, message)) {
              Messages.update({ appointmentId: message.appointmentId }, { $set: message })
            }
          } else {
            Messages.insert({
              ...message,
              createdAt: new Date()
            })
            insertedCount++
          }
        })

        if (insertedCount > 0) {
          Events.post('messages/createReminders', {
            calendarId,
            appointmentsCount: appointments.length,
            appointmentsWithMobileCount: appointmentsWithMobile.length,
            uniqueAppointmentsWithMobileCount: uniqueAppointmentsWithMobile.length,
            messagePayloadsCount: messagePayloads.length,
            messagesCount: messages.length,
            insertedCount
          })
        }
      })
    }
  })
}
