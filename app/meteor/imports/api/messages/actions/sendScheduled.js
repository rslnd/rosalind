import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Calendars } from '../../calendars'
import { Appointments } from '../../appointments'
import { Patients } from '../../patients'
import { Settings } from '../../settings'
import { isQuietTimeRespected } from '../../messages/methods/isQuietTimeRespected'
import { Tags } from '../../tags'
import { hasRole } from '../../../util/meteor/hasRole'

let SMS
if (Meteor.isServer) {
  SMS = require('../../messages/server/channels/sms')
}

export const sendScheduled = ({ Messages }) => {
  return new ValidatedMethod({
    name: 'messages/sendScheduled',
    mixins: [CallPromiseMixin],
    validate () {},
    async run () {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (!await Settings.get('messages.sms.enabled')) { return }

      if (!Meteor.isServer) { return }

      // Retry reminders that failed to send: once, ~24h after the failure, and
      // only while still well before the appointment (invalidAfter, i.e.
      // start - 4h, must still be in the future). Flipping them back to
      // 'scheduled' lets the normal send path below pick them up in this same
      // tick; the `retries` counter (incremented on every failure in
      // channels/sms) caps this at a single retry.
      const retryAfterHours = 24
      const maxRetries = 1

      await Messages.updateAsync({
        status: 'failed',
        direction: 'outbound',
        type: 'appointmentReminder',
        removed: { $ne: true },
        retries: { $lte: maxRetries },
        failedAt: { $lt: moment().subtract(retryAfterHours, 'hours').toDate() },
        invalidAfter: { $gt: moment().toDate() }
      }, {
        $set: { status: 'scheduled' }
      }, { multi: true })

      const timeWindow = {
        $gt: moment().subtract(5, 'day').toDate(),
        $lt: moment().toDate()
      }

      const maxSentPerRecipientLimit = 3

      const sentToNumbersToday = (await Messages.find({
        status: 'sent',
        direction: 'outbound',
        type: 'appointmentReminder',
        removed: { $ne: true },
        sentAt: {
          $gt: moment().startOf('day').toDate(),
          $lt: moment().endOf('day').toDate()
        }
      }).fetchAsync()).map((m) => m.to)

      const candidates = await Messages.find({
        status: 'scheduled',
        direction: 'outbound',
        scheduled: timeWindow,
        invalidBefore: { $lt: moment().toDate() },
        invalidAfter: { $gt: moment().toDate() },
        removed: { $ne: true }
      }).fetchAsync()

      const scheduledMessages = []
      for (const message of candidates) {
        const patient = await Patients.findOneAsync({ _id: message.patientId })
        if (patient && patient.noSMS) {
          console.log('[Messages] sendScheduled: Skipping', message._id, 'because patient has noSMS set' )
          continue
        }

        const appointment = await Appointments.findOneAsync({ _id: message.appointmentId })
        if (!appointment) {
          console.log('[Messages] sendScheduled: Skipping', message._id, 'because appointment', message.appointmentId, 'was not found (likely removed)')
          continue
        }

        const calendar = await Calendars.findOneAsync({ _id: appointment.calendarId })
        if ((calendar && !calendar.smsAppointmentReminder) || !calendar) {
          console.log('[Messages] sendScheduled: Skipping', message._id, 'because calendar disabled sms reminders')
          continue
        }

        const tags = await Tags.methods.expand(appointment.tags)
        if (tags.some(t => t.noSmsAppointmentReminder)) {
          // console.log('[Messages] sendScheduled: Skipping', message._id, 'because appointment', appointment._id, 'has a tag with noSmsAppointmentReminder set')
          continue
        }

        if (appointment.assigneeId && await hasRole(appointment.assigneeId, ['noSmsAppointmentReminder'])) {
          console.log('[Messages] sendScheduled: Skipping', message._id, 'because assignee of appointment', appointment._id, 'has role noSmsAppointmentReminder')
          continue
        }

        // Only allow confirmation of cancelation to be sent during quiet time
        const quietTimeRespected = isQuietTimeRespected(message)

        const withinSentPerRecipientLimit = (sentToNumbersToday.filter((n) => n === message.to).length <= maxSentPerRecipientLimit)
        const ok = quietTimeRespected && withinSentPerRecipientLimit

        if (!withinSentPerRecipientLimit) {
          console.warn(`[Messages] sendScheduled: Sent count per recipient exceeded, message ${message._id} not sent`, { quietTimeRespected, withinSentPerRecipientLimit })
        }

        if (!ok) { continue }

        switch (message.channel) {
          case 'SMS':
            scheduledMessages.push(SMS.send(message._id))
            break
          default:
            throw new Meteor.Error(500, `[Messages] sendScheduled: Unknown channel ${message.channel} of message ${message._id}`)
        }
      }

      return Promise.all(scheduledMessages)
    }
  })
}
