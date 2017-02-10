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

// TODO: Replace with GraphQL
export const findUpcomingAppointments = () => {
  const appointments = Appointments.find({
    start: {
      $gt: moment.tz(process.env.TZ).add(1, 'day').startOf('day').toDate(),
      $lt: moment.tz(process.env.TZ_CLIENT).add(1, 'day').toDate()
    },
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
          body: 'Ihr Termin ist am %day um %time Uhr.',
          footer: process.env.SMS_REMINDER_FOOTER
        }

        return {
          type: 'appointmentReminder',
          channel: 'SMS',
          direction: 'outbound',
          status: 'scheduled',
          to: payload.contacts[0].value,
          scheduled: moment(payload.start).subtract(24, 'hours').toDate(),
          text: getAppointmentReminderText(templates, payload),
          payload
        }
      }).filter(identity)

      messages.map((message) => {
        const existingMessage = Messages.findOne({ 'payload.appointmentId': message.payload.appointmentId })
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
