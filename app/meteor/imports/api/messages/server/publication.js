import { publish } from '../../../util/meteor/publish'
import { Messages } from '../'

export const publication = () => {
  publish({
    name: 'message',
    roles: ['appointments', 'inboundCalls', 'admin'],
    args: { messageId: String },
    fn: function ({ messageId }) {
      console.log('pubbing', messageId, Messages.find({
        _id: messageId
      }).fetch())

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
}
