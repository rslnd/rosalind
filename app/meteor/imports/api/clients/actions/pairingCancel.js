import { action } from '../../../util/meteor/action'
import { Events } from '../../events'

export const pairingCancel = ({ Clients }) =>
  action({
    name: 'clients/pairingCancel',
    allowAnonymous: false,
    roles: ['admin', 'pair'],
    args: {
      clientKey: String
    },
    fn ({ clientKey }) {
      Events.post('clients/pairingCancel')
      Clients.update({ clientKey }, {
        $unset: {
          pairingToken: 1,
          pairingTokenCreatedAt: 1,
          pairingTokenCreatedBy: 1
        }
      })
    }
  })
