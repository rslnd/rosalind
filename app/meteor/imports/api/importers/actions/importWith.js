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
    fn ({ importer, name, content }) {
      if (Meteor.isServer) {
        const { isTrustedNetwork } = require('../../customer/isTrustedNetwork')
        if (!this.userId && (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      }

      try {
        switch (importer) {
          case 'eoswinRevenueReports':
            return Importers.actions.eoswin.revenueReports.call({ name, content })
          case 'eoswinJournalReports':
            return Importers.actions.eoswin.journalReports.call({ name, content })
          case 'eoswinPatients':
            return Importers.actions.eoswin.patients.call({ name, content })
          case 'xdt':
            return Importers.actions.xdt.call({ name, content })
          case 'genericJson':
            return Importers.actions.genericJson.call({ name, content })
          default:
            throw new Meteor.Error('no-importer-found', `Unknown importer ${importer}`)
        }
      } catch (e) {
        console.error(e)
      }
    }
  })
}
