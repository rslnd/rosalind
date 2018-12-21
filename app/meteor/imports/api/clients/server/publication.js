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
    name: 'client',
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
          description: 1,
          settings: 1,
          pairingAllowed: 1,
          pairingToken: 1
        }
      })
    }
  })

  publish({
    name: 'client-producers',
    args: {
      clientKey: String
    },
    preload: true,
    fn: function ({ clientKey }) {
      const consumer = Clients.findOne({ clientKey })
      const producers = Clients.find({ pairedTo: consumer._id }, { fields: {
        _id: 1,
        description: 1,
        pairedTo: 1
      }})

      return producers
    }
  })
}
