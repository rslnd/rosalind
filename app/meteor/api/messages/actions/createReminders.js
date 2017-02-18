import some from 'lodash/some'
import uniqBy from 'lodash/uniqBy'
import identity from 'lodash/identity'
import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Events } from 'api/events'
import { Appointments } from 'api/appointments'
import { Patients } from 'api/patients'
import { Users } from 'api/users'
import { isMobileNumber } from '../methods/isMobileNumber'
import { getAppointmentReminderText } from '../methods/getAppointmentReminderText'

export const sendHoursBeforeAppointment = 48

// Don't immediately send out reminder if appointment is very soon,
// We don't want the patient to receive the reminder while still
// on the phone with the clinic.
// TODO: Increase before going into production
export const waitMinutesAfterNewAppointment = 1

// TODO: Replace with GraphQL
export const findUpcomingAppointments = () => {
  const start = {
    $gt: moment.tz(process.env.TZ_CLIENT).add(sendHoursBeforeAppointment, 'hours').startOf('day').toDate(),
    $lt: moment.tz(process.env.TZ_CLIENT).add(sendHoursBeforeAppointment, 'hours').endOf('day').toDate()
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
      if (patient && patient.profile && patient.profile.contacts) {
        contacts = patient.profile.contacts
      }
    }

    const assignee = appointment.assigneeId && Users.findOne({ _id: appointment.assigneeId })

    let result = {
      _id: appointment._id,
      assigneeId: assignee && appointment.assigneeId,
      start: appointment.start
    }

    if (patient) {
      result.patient = {
        _id: patient._id,
        profile: {
          lastName: patient && patient.lastName(),
          prefix: patient && patient.prefix(),
          gender: patient && patient.profile.gender
        }
      }

      if (contacts) {
        result.patient.profile.contacts = contacts
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

      if (!process.env.SMS_REMINDER_TEXT) {
        throw new Meteor.Error(500, 'SMS_REMINDER_TEXT not set')
      }

      const appointments = findUpcomingAppointments()
      const appointmentsWithMobile = appointments.filter((a) => {
        if (a.patient && a.patient.profile && a.patient.profile.contacts) {
          return some(a.patient.profile.contacts, (c) =>
            (c.channel === 'Phone' && isMobileNumber(c.value))
          )
        }
      })
      const uniqueAppointmentsWithMobile = uniqBy(appointmentsWithMobile, (a) => (
        a.patient.profile.contacts[0].value
      ))

      let insertedCount = 0
      const messagePayloads = uniqueAppointmentsWithMobile.map((a) => {
        return {
          appointmentId: a._id,
          assigneeId: a.assigneeId,
          patientId: a.patient._id,
          start: a.start,
          lastName: a.patient.profile.lastName,
          prefix: a.patient.profile.prefix,
          gender: a.patient.profile.gender,
          contacts: a.patient.profile.contacts
        }
      })

      const messages = messagePayloads.map((payload) => {
        const templates = {
          dayFormat: 'dd., D.M.',
          timeFormat: 'HH:mm',
          timezone: process.env.TZ_CLIENT,
          text: process.env.SMS_REMINDER_TEXT
        }

        return {
          type: 'appointmentReminder',
          channel: 'SMS',
          direction: 'outbound',
          status: 'scheduled',
          to: payload.contacts[0].value,
          scheduled: moment(payload.start).subtract(sendHoursBeforeAppointment, 'hours').toDate(),
          text: getAppointmentReminderText(templates, payload),
          invalidBefore: moment(payload.start).subtract(1, 'week').toDate(),
          invalidAfter: moment(payload.start).startOf('day').subtract(8, 'hours').toDate(),
          payload
        }
      }).filter(identity)

      messages.map((message) => {
        const existingMessage = Messages.findOne({
          'payload.appointmentId': message.payload.appointmentId,
          removed: { $ne: true }
        })

        if (existingMessage) {
          if (!isSameMessage(existingMessage, message)) {
            Messages.update({ 'payload.appointmentId': message.payload.appointmentId }, { $set: message })
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
          appointmentsCount: appointments.length,
          appointmentsWithMobileCount: appointmentsWithMobile.length,
          uniqueAppointmentsWithMobileCount: uniqueAppointmentsWithMobile.length,
          messagePayloadsCount: messagePayloads.length,
          messagesCount: messages.length,
          insertedCount
        })
      }
    }
  })
}
