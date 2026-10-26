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
    async fn ({ clientKey }) {
      Events.post('clients/pairingCancel')
      await Clients.updateAsync({ clientKey }, {
        $unset: {
          pairingToken: 1,
          pairingTokenCreatedAt: 1,
          pairingTokenCreatedBy: 1
        }
      })
    }
  })
