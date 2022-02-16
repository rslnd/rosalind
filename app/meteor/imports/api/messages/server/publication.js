import { publish } from '../../../util/meteor/publish'
import { Messages } from '../'

export const publication = () => {
  publish({
    name: 'message',
    roles: ['appointments', 'calendar-column-*', 'inboundCalls', 'admin'],
    args: { messageId: String },
    fn: function ({ messageId }) {
      return Messages.find({
        _id: messageId
      })
    }
  })

  publish({
    name: 'messages-inbound',
    roles: ['admin', 'system'],
    fn: function () {
      return Messages.find({
        direction: 'inbound'
      }, {
        sort: {
          createdAt: -1
        },
        limit: 200
      })
    }
  })

  publish({
    name: 'messages-patient',
    roles: ['admin', 'messages', 'patient'],
    args: {
      patientId: String
    },
    fn: function({ patientId }) {
      return Messages.find({
        patientId
      }, {
        sort: {
          createdAt: 1
        }
      })
    }
  })
}
