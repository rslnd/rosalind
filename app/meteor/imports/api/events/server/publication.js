import { publish } from '../../../util/meteor/publish'
import { Events } from '../'

export default () => {
  publish({
    name: 'events',
    roles: ['events'],
    fn: function () {
      return Events.find({
        limit: 20,
        sort: {
          createdAt: -1
        }
      })
    }
  })
}
