import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { allowedImporters } from '../allowedImporters'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const importWith = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/importWith',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      importer: { type: String, allowedValues: allowedImporters },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ importer, name, content }) {
      this.unblock()

      if (Meteor.isServer) {
        const { isTrustedNetwork } = require('../../customer/server/isTrustedNetwork')
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
