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
      if (!Meteor.userId()) { return }

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
          default:
            throw new Meteor.Error('no-importer-found', `Unknown importer ${importer}`)
        }
      } catch (e) {
        console.error(e)
        throw new Meteor.Error(500, 'Failed to import')
      }
    }
  })
}
