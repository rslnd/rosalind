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
    $lt: cutoffDate.clone().endOf('day').toDate()
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
      calendarId: appointment.calendarId,
      tags: appointment.tags
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

      const mobilePhone = (contacts = []) => {
        const c = find(contacts, c =>
          (c.channel === 'Phone' &&
          isMobileNumber(c.value))
        )
        return c && c.value
      }

      Calendars.find({ smsAppointmentReminder: true }).fetch().map(calendar => {
        const calendarId = calendar._id

        const { calculateReminderDate, calculateFutureCutoff } = reminderDateCalculator({
          holidays,
          days: 1 // minimum cutoff here
        })

        const cutoffDate = calculateFutureCutoff(moment.tz(process.env.TZ_CLIENT))
        console.log('reminders cutoff date', cutoffDate)
        const appointments = findUpcomingAppointments(cutoffDate)

        console.log('reminders cutoff date', cutoffDate, appointments[0].start, appointments[appointments.length - 1].start)

        console.log('DEBUG', appointments.length, appointments.find(a=> (a._id === 'XuTkK7dTBLNgG7Fvn')))

        const debug = (a, ...msg) => {
          // if ((a.appointmentCreatedAt || a.createdAt)
            //  && moment().subtract(1, 'minute').isBefore(a.appointmentCreatedAt || a.createdAt)) {
            console.log('DEBUG SMS: ', ...msg)
          // }
        }


        const appointmentsWithMobile = appointments.filter((a) => {
          if (a.patient && a.patient.noSMS) {
            debug(a, 'patient.noSms')
            return false
          }

          if (a.patient && a.patient.contacts && mobilePhone(a.patient.contacts)) {
            return true
          } else {
            debug(a, 'no contacts', a, a.patient, a.patient && a.patient.contacts)
            return false
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
            contacts: a.patient.contacts,
            appointmentCreatedAt: a.createdAt
          }
        })

        console.log('apptsWMobile', appointmentsWithMobile.length)

        const messages = messagePayloads.map((payload) => {
          const calendar = Calendars.findOne({ _id: payload.calendarId })
          if ((calendar && !calendar.smsAppointmentReminder) || !calendar) {
            debug(payload, 'no calendar or smsAppointmentReminder: false')
            return false
          }

          const tags = Tags.methods.expand(payload.tags)

          if (payload.assignee === 'y8JK7n9D4W8HvMpMu') {
            console.log(hasRole(payload.assigneeId, ['forceSmsAppointmentReminder']),
              payload)

          }

          const forceSMS = payload.assigneeId
            ? hasRole(payload.assigneeId, ['forceSmsAppointmentReminder'])
            : false


          if (forceSMS) {
            debug(payload, 'forceSMS', forceSMS)
          }

          if (true) {
            if (tags.some(t => t.noSmsAppointmentReminder)) {
              debug(payload, 'some tags noSmsAppointmentReminder')
              return false
            }

            if (payload.assigneeId && hasRole(payload.assigneeId, ['noSmsAppointmentReminder'])) {
              debug(payload, 'assignee noSmsAppointmentReminder')
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
          if (process.env.CUSTOMER_PREFIX === 'hzw' && Settings.get('messages.sms.appointmentReminder.textTelemedizinSpalte')) {
            if (payload.assigneeId && hasRole(payload.assigneeId, ['telemedicine-provider'])) {
              text = Settings.get('messages.sms.appointmentReminder.textTelemedizinSpalte')
              calendar.smsDaysBefore = 1 // send 24h before appt
              debug(payload, 'set text to: ' + text)
            }
          }

          if (!text) {
            debug(payload, 'no text')
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
        }).filter(identity)

        console.log('upserting messages: ' + messages.length)

        messages.map((message) => {
          const existingMessage = Messages.findOne({
            appointmentId: message.appointmentId,
            removed: { $ne: true }
          })

          if (existingMessage) {
            // noop
            // if (!isSameMessage(existingMessage, message)) {
            //   Messages.update({ _id: existingMessage }, { $set: message })
            // }
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
