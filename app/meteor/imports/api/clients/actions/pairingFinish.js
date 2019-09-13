import { action } from '../../../util/meteor/action'
import { Meteor } from 'meteor/meteor'
import { Events } from '../../events'

export const pairingFinish = ({ Clients }) =>
  action({
    name: 'clients/pairingFinish',
    allowAnonymous: true,
    requireClientKey: true,
    args: {
      clientKey: String,
      pairingToken: String
    },
    fn ({ clientKey, pairingToken }) {
      const consumer = Clients.findOne({ pairingToken })
      if (!consumer) { throw new Meteor.Error(404, 'Consumer client not found') }
      if (!consumer.pairingAllowed) { throw new Meteor.Error(403, 'Pairing not allowed') }

      const producer = Clients.findOne({ clientKey })
      if (!producer) { throw new Meteor.Error(404, 'Producer client not found') }

      Events.post('clients/pairingFinish', {
        consumerId: consumer._id,
        producerId: producer._id,
        userId: consumer.pairingTokenCreatedBy
      })

      Clients.update({ _id: consumer._id }, {
        $unset: {
          pairingToken: 1,
          pairingTokenCreatedAt: 1,
          pairingTokenCreatedBy: 1
        }
      })

      Clients.update({ _id: producer._id }, {
        $set: {
          pairedTo: consumer._id,
          pairedBy: consumer.pairingTokenCreatedBy,
          pairedAt: new Date()
        }
      })

      return consumer._id
    }
  })
