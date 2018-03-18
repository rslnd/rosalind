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
      version: { type: String, min: 3 },
      systemInfo: { type: Object, blackbox: true },
      settings: { type: Object, blackbox: true, optional: true }
    }).validator(),

    run ({ clientKey, systemInfo, version, settings }) {
      if (this.isSimulation) {
        return true
      }

      const existingClient = Clients.findOne({ clientKey })

      if (existingClient) {
        Clients.update({ clientKey }, {
          $set: {
            lastActionAt: new Date(),
            systemInfo
          }
        })
        return true
      } else {
        if (!Settings.get('clients.allowNewClients')) {
          console.error('[Clients] New client registration is disabled')
          return false
        } else {
          Clients.insert({
            clientKey,
            systemInfo,
            settings,
            version,
            createdAt: new Date()
          })
          return true
        }
      }
    }
  })
}
