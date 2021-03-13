import { Meteor } from 'meteor/meteor'
import { Events } from '../../events'
import { hasRole } from '../../../util/meteor/hasRole'
import { action, Optional } from '../../../util/meteor/action'

export const print = ({ Consents }) =>
  action({
    name: 'consents/print',
    args: {
      patientId: String,
      assigneeId: String,
      appointmentId: String,
      templateId: String,
      clientId: Optional(String),
      payload: Object
    },
    roles: ['templates-print', 'media', 'patients', 'appointments', 'calendar-column-*', 'admin'],
    fn: function({ patientId, assigneeId, appointmentId, templateId, clientId, payload }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const consent = {
        patientId,
        assigneeId,
        appointmentId,
        templateId,
        clientId,
        payload,
        createdAt: new Date(),
        createdBy: this.userId,
        printedAt: new Date(),
        printedBy: this.userId
      }

      console.log(consent)

      const consentId = Consents.insert(consent)

      Events.post('consents/print', { consentId })

      return consentId
    }
  })
