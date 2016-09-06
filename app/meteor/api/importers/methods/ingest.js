import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { allowedImporters } from '../allowedImporters'

export const ingest = ({ Importers }) => {
  const determineImporter = ({ name, content }) => {
    if (name && name.includes('Ärzte Statistik Umsätze')) { return 'eoswinReports' }
    if (name && name.match(/\.PAT$/)) { return 'eoswinPatients' }
  }

  return new ValidatedMethod({
    name: 'importers/ingest',

    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: allowedImporters },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ importer, name, content }) {
      if (!Meteor.userId()) { return }

      if (!importer) {
        importer = determineImporter({ name, content })
      }

      if (importer) {
        return Importers.methods.importWith.call({ importer, name, content })
      } else {
        throw new Meteor.Error('no-importer-found', `Could not determine importer from filename ${name}`)
      }
    }
  })
}
