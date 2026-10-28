import uniqBy from 'lodash/uniqBy'
import identity from 'lodash/identity'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'
import { Calendars } from '../../calendars'
import { Appointments } from '../../appointments'
import { Patients } from '../../patients'
import { Users } from '../../users'
import { Schedules } from '../../schedules'
import { Settings } from '../../settings'
import { reminderDateCalculator } from '../methods/reminderDateCalculator'
import { buildReminderMessage, mobilePhone } from '../methods/buildReminderMessage'

// Don't immediately send out reminder if appointment is very soon,
// We don't want the patient to receive the reminder while still
// on the phone with the clinic.
export const waitMinutesAfterNewAppointment = 120

// TODO: Replace with GraphQL
export const findUpcomingAppointments = async (cutoffDate) => {
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

  const appointments = await Appointments.find(selector, {
    sort: {
      start: 1
    }
  }).fetchAsync()

  return await Promise.all(appointments.map(async (appointment) => {
    let patient, contacts

    if (appointment.patientId) {
      patient = await Patients.findOneAsync({ _id: appointment.patientId })
      if (patient && patient.contacts) {
        contacts = patient.contacts
      }
    }

    const assignee = appointment.assigneeId && await Users.findOneAsync({ _id: appointment.assigneeId })

    let result = {
      ...appointment,
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
  }))
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
    async run () {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!await Settings.get('messages.sms.enabled')) { return }

      const holidays = await Schedules.find({
        type: 'holiday',
        removed: { $ne: true }
      }).fetchAsync()

      ;await Promise.all((await Calendars.find({ smsAppointmentReminder: true }).fetchAsync()).map(async calendar => {
        const calendarId = calendar._id

        const { calculateFutureCutoff } = reminderDateCalculator({
          holidays,
          days: (
            Number.isInteger(parseInt(await Settings.get('messages.sms.appointmentReminder.daysBefore')))
            ? parseInt(await Settings.get('messages.sms.appointmentReminder.daysBefore'))
            : 2
          )
        })

        const cutoffDate = calculateFutureCutoff(moment.tz(process.env.TZ_CLIENT))
        // console.log('reminders cutoff date', cutoffDate)
        const appointments = await findUpcomingAppointments(cutoffDate)

        // console.log('reminders cutoff date', cutoffDate, appointments[0] && appointments[0].start, appointments[0] && appointments[appointments.length - 1].start)

        // console.log('DEBUG appts length', appointments.length, appointments.find(a=> (a._id === 'XuTkK7dTBLNgG7Fvn')))

        const appointmentsWithMobile = appointments.filter((a) => {
          if (a.patient && a.patient.noSMS) {
            return false
          }

          if (a.patient && a.patient.contacts && mobilePhone(a.patient.contacts)) {
            return true
          } else {
            return false
          }
        })
        // Dedupe per patient (not per phone number): otherwise two distinct
        // patients sharing a number (e.g. spouses, parent + child) would
        // collapse into one and only one of them would ever be reminded.
        // Appointments are sorted by `start` asc, so the earliest is kept.
        const uniqueAppointmentsWithMobile = uniqBy(appointmentsWithMobile, (a) => (
          a.patient._id
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

        // console.log('apptsWMobile', appointmentsWithMobile.length)

        const messages = (await Promise.all(messagePayloads
          .map((payload) => buildReminderMessage({ payload, holidays }))))
          .filter(identity)

        console.log('upserting messages: ' + messages.length)

        await Promise.all(messages.map(async (message) => {
          const existingMessage = await Messages.findOneAsync({
            appointmentId: message.appointmentId,
            removed: { $ne: true }
          })

          if (existingMessage) {
            // noop
            // if (!isSameMessage(existingMessage, message)) {
            //   Messages.update({ _id: existingMessage }, { $set: message })
            // }
          } else {
            await Messages.insertAsync({
              ...message,
              createdAt: new Date()
            })
            insertedCount++
          }
        }))

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
      }))
    }
  })
}
