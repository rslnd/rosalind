import { publish } from '../../../util/meteor/publish'
import { Messages } from '../'

export const publication = () => {
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
