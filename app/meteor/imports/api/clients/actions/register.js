import { Settings } from '../../settings'
import { Events } from '../../events'
import { action, Match } from '../../../util/meteor/action'

export const register = ({ Clients }) =>
  action({
    name: 'clients/register',
    args: {
      clientKey: String,
      systemInfo: Match.Maybe(Match.Optional(Object))
    },
    allowAnonymous: true,
    fn ({ clientKey, systemInfo }) {
      if (this.isSimulation) {
        return { isOk: true }
      }

      const existingClient = Clients.findOne({ clientKey })

      if (existingClient) {
        Clients.update({ clientKey }, {
          $set: {
            lastActionAt: new Date(),
            systemInfo: systemInfo || existingClient.systemInfo,
            connectionId: this.connection.id
          }
        })
        Events.post('clients/register/existing', { existingClientId: existingClient._id })
        return { isOk: true, settings: existingClient.settings }
      } else {
        if (!Settings.get('clients.allowNewClients')) {
          console.error('[Clients] New client registration is disabled')
          console.error('[Clients] Blocked attempt to register new client key', clientKey)
          Events.post('clients/register/blocked', { blocked: true })
          return { isOk: false }
        } else {
          const isBanned = !(process.env.NODE_ENV === 'staging' && process.env.INSECURE_APPROVE_NEW_CLIENTS)

          const clientId = Clients.insert({
            clientKey,
            systemInfo,
            createdAt: new Date(),
            isBanned
          })
          Events.post('clients/register/banned', { newClientId: clientId })
          return { isOk: true }
        }
      }
    }
  })
