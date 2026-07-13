import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Appointments } from '../../appointments'
import { Patients } from '../../patients'
import { Schedules } from '../../schedules'
import { Settings } from '../../settings'
import { buildReminderMessage } from '../methods/buildReminderMessage'

// (Re)creates the scheduled reminder for a single appointment on demand.
//
// The periodic `createReminders` job only ever looks at appointments exactly
// `daysBefore` business days out (a single, non-sliding day window). So when an
// appointment is *moved* to a nearer date, its old reminder is removed (see
// appointments/actions/move.js) but the periodic job never revisits it and the
// patient would silently get no reminder. This action rebuilds it immediately.
export const createReminderForAppointment = ({ Messages }) => {
  return new ValidatedMethod({
    name: 'messages/createReminderForAppointment',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      appointmentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),
    run ({ appointmentId }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!Meteor.isServer) { return }

      if (!Settings.get('messages.sms.enabled')) { return }

      const appointment = Appointments.findOne({ _id: appointmentId })

      if (!appointment ||
          appointment.removed ||
          appointment.canceled ||
          moment(appointment.start).isBefore(moment())) {
        return
      }

      // Mirror the idempotency guard of createReminders: never create a second
      // reminder for an appointment that already has one (e.g. one already sent).
      const existingMessage = Messages.findOne({
        appointmentId,
        removed: { $ne: true }
      })

      if (existingMessage) { return }

      const patient = appointment.patientId &&
        Patients.findOne({ _id: appointment.patientId })

      if (!patient || !patient.contacts) { return }

      if (patient.noSMS) { return }

      const holidays = Schedules.find({
        type: 'holiday',
        removed: { $ne: true }
      }).fetch()

      const payload = {
        appointmentId: appointment._id,
        tags: appointment.tags,
        calendarId: appointment.calendarId,
        assigneeId: appointment.assigneeId,
        patientId: patient._id,
        start: appointment.start,
        lastName: patient.lastName,
        prefix: Patients.methods.prefix(patient),
        gender: patient.gender,
        contacts: patient.contacts,
        appointmentCreatedAt: appointment.createdAt
      }

      // buildReminderMessage can throw (e.g. buildMessageText rejects an
      // over-long template). Never let that abort the caller (a move must
      // still succeed even if its reminder can't be built).
      let message
      try {
        message = buildReminderMessage({ payload, holidays })
      } catch (e) {
        console.error(`[Messages] createReminderForAppointment: Failed to build reminder for appointment ${appointmentId}`, e)
        return
      }

      if (!message) { return }

      // buildReminderMessage already resolved a mobile number into `to`; bail
      // if the patient has no usable mobile contact.
      if (!message.to) { return }

      Messages.insert({
        ...message,
        createdAt: new Date()
      })

      console.log(`[Messages] createReminderForAppointment: Created reminder for appointment ${appointmentId}`)
    }
  })
}
