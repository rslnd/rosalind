import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const eoswinJournalReports = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/eoswinJournalReports',

    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: [ 'eoswinJournalReports' ] },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ name, content }) {
      if (this.isSimulation) { return }
      if (!Meteor.userId()) { return }
      console.log('[Importers] eoswinJournalReports: parsing addendum')
    }
  })
}
