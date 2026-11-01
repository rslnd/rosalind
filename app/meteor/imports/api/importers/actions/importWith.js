import { Meteor } from 'meteor/meteor'
import { allowedImporters } from '../allowedImporters'
import { action, Match } from '../../../util/meteor/action'

export const importWith = ({ Importers }) => {
  return action({
    name: 'importers/importWith',
    args: {
      importer: Match.OneOf(...allowedImporters),
      name: String,
      content: String
    },
    allowAnonymous: true,
    async fn ({ importer, name, content }) {
      if (Meteor.isServer) {
        const { isTrustedNetwork } = require('../../customer/isTrustedNetwork')
        if (!this.userId && (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      }

      try {
        switch (importer) {
          case 'eoswinPatients':
            return await Importers.actions.eoswin.patients.callPromise({ name, content })
          case 'xdt':
            return await Importers.actions.xdt.callPromise({ name, content })
          case 'genericJson':
            return await Importers.actions.genericJson.callPromise({ name, content })
          default:
            throw new Meteor.Error('no-importer-found', `Unknown importer ${importer}`)
        }
      } catch (e) {
        console.error(e)
      }
    }
  })
}
