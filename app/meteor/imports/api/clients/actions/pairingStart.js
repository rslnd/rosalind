import { action } from '../../../util/meteor/action'
import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { Events } from '../../events'

export const pairingStart = ({ Clients }) =>
  action({
    name: 'clients/pairingStart',
    allowAnonymous: false,
    roles: ['admin', 'pair'],
    args: {
      clientKey: String
    },
    fn: function ({ clientKey }) {
      const client = Clients.findOne({ clientKey })
      if (!client) { throw new Meteor.Error(404, 'Client not found') }
      if (!client.pairingAllowed) { throw new Meteor.Error(403, 'Pairing not allowed') }

      const pairingToken = Random.hexString(90)

      Events.post('clients/pairingStart', { clientId: client._id })

      Clients.update({ clientKey }, {
        $set: {
          pairingToken,
          pairingTokenCreatedAt: new Date(),
          pairingTokenCreatedBy: this.userId
        }
      })
    }
  })
