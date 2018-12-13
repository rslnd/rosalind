import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Calendars } from '../../calendars'
import { Appointments } from '../../appointments'
import { Patients } from '../../patients'
import { Settings } from '../../settings'
import { isQuietTimeRespected } from '../../messages/methods/isQuietTimeRespected'

let SMS
if (Meteor.isServer) {
  SMS = require('../../messages/channels/sms')
}

export const sendScheduled = ({ Messages }) => {
  return new ValidatedMethod({
    name: 'messages/sendScheduled',
    mixins: [CallPromiseMixin],
    validate () {},
    run () {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!Settings.get('messages.sms.enabled')) { return }

      if (!Meteor.isServer) { return }

      const timeWindow = {
        $gt: moment().subtract(1, 'day').toDate(),
        $lt: moment().toDate()
      }

      const maxSentPerRecipientLimit = 3

      const sentToNumbersToday = Messages.find({
        status: 'sent',
        direction: 'outbound',
        type: 'appointmentReminder',
        removed: { $ne: true },
        sentAt: {
          $gt: moment().startOf('day').toDate(),
          $lt: moment().endOf('day').toDate()
        }
      }).fetch().map((m) => m.to)

      const scheduledMessages = Messages.find({
        status: 'scheduled',
        direction: 'outbound',
        scheduled: timeWindow,
        invalidBefore: { $lt: moment().toDate() },
        invalidAfter: { $gt: moment().toDate() },
        removed: { $ne: true }
      }).fetch().filter((message) => {
        const patient = Patients.findOne({ _id: message.patientId })
        if (patient && patient.noSMS) {
          return false
        }

        const appointment = Appointments.findOne({ _id: message.payload.appointmentId })
        if (!appointment) {
          return false
        }

        const calendar = Calendars.findOne({ _id: appointment.calendarId })
        if ((calendar && !calendar.smsAppointmentReminder) || !calendar) {
          return false
        }

        // Only allow confirmation of cancelation to be sent during quiet time
        const quietTimeRespected = isQuietTimeRespected(message)

        const withinSentPerRecipientLimit = (sentToNumbersToday.filter((n) => n === message.to).length <= maxSentPerRecipientLimit)
        const ok = quietTimeRespected && withinSentPerRecipientLimit

        if (!withinSentPerRecipientLimit) {
          console.warn(`[Messages] sendScheduled: Sent count per recipient exceeded, message ${message._id} not sent`, { quietTimeRespected, withinSentPerRecipientLimit })
        }

        return ok
      }).map((message) => {
        switch (message.channel) {
          case 'SMS':
            return SMS.send(message._id)
          default:
            throw new Meteor.Error(500, `[Messages] sendScheduled: Unknown channel ${message.channel} of message ${message._id}`)
        }
      })

      return Promise.awaitAll(scheduledMessages)
    }
  })
}
