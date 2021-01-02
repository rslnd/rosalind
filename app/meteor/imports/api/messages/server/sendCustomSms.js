import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { Events } from '../../events'
import { Messages } from '../../messages'
import { Patients } from '../../patients'
import { Settings } from '../../settings'
import { hasRole } from '../../../util/meteor/hasRole'
import { buildMessageText } from '../methods/buildMessageText'
import { action } from '../../../util/meteor/action'
import { SMS } from './channels/sms'

export const sendCustomSms = () =>
  action({
    name: 'messages/sendCustomSms',
    args: {
      patientId: String,
      text: String
    },
    roles: ['admin', 'messages-sendCustomSms'],
    fn: function({ patientId, text }) {
      if (!Meteor.isServer) { return }
      if (!Settings.get('messages.sms.enabled')) {
        throw new Meteor.Error('Sending SMS is disabled in global settings')
      }

      const userId = this.userId

      if (!userId || !hasRole(userId, ['admin', 'messages-sendCustomSms'])) {
        throw new Meteor.Error('You are not authorized to send custom SMS')
      }

      const patient = Patients.findOne({ _id: patientId })
      if (!patient || (patient && patient.noSMS)) {
        throw new Meteor.Error('Patient does not want to receive SMS')
      }

      const to = patient.contacts.find(c => c.channel === 'Phone').value

      if (!to) {
        throw new Meteor.Error('Patient does not have a valid phone number')
      }

      const messageId = Messages.insert({
        type: 'custom',
        channel: 'SMS',
        direction: 'outbound',
        text: buildMessageText({
          text
        }),
        to,
        status: 'final',
        invalidBefore: new Date(),
        invalidAfter: moment().add(15, 'minutes').toDate(),
        patientId,
        userId,
        payload: {
          userId,
          patientId
        }
      })

      Events.post('message/sendCustomSms', {
        messageId
      })


      SMS.send(messageId)

      return messageId
    }
  })
