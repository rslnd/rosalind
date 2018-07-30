import { publish } from '../../../util/meteor/publish'
import { Clients } from '../'

export const publication = () => {
  publish({
    name: 'clients',
    roles: ['admin'],
    fn: function () {
      return Clients.find({})
    }
  })

  publish({
    name: 'client-settings',
    args: {
      clientKey: String
    },
    preload: true,
    fn: function ({ clientKey }) {
      return Clients.find({
        clientKey
      }, {
        limit: 1,
        fields: {
          clientKey: 1,
          settings: 1
        }
      })
    }
  })
}
