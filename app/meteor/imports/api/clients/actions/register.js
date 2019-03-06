import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Settings } from '../../settings'

export const register = ({ Clients }) => {
  return new ValidatedMethod({
    name: 'clients/register',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      clientKey: { type: String, min: 200 },
      systemInfo: { type: Object, blackbox: true }
    }).validator(),

    run ({ clientKey, systemInfo }) {
      if (this.isSimulation) {
        return { isOk: true }
      }

      const existingClient = Clients.findOne({ clientKey })

      if (existingClient) {
        Clients.update({ clientKey }, {
          $set: {
            lastActionAt: new Date(),
            systemInfo
          }
        })
        return { isOk: true, settings: existingClient.settings }
      } else {
        if (!Settings.get('clients.allowNewClients')) {
          console.error('[Clients] New client registration is disabled')
          console.error('[Clients] Blocked attempt to register new client key', clientKey)
          return { isOk: false }
        } else {
          Clients.insert({
            clientKey,
            systemInfo,
            createdAt: new Date()
          })
          return { isOk: true }
        }
      }
    }
  })
}
