import iconv from 'iconv-lite'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { allowedImporters } from '../allowedImporters'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const ingest = ({ Importers }) => {
  const determineImporter = ({ name, content }) => {
    if (name && name.includes('Ärzte Statistik Umsätze')) { return 'eoswinReports' }
    if (name && name.match(/\.PAT$/i)) { return 'eoswinPatients' }
    if (name && name.match(/(\.gdt)$|(\.bdt$)|(\.xdt$)/i)) { return 'xdt' }
  }

  const determineEncoding = ({ importer }) => {
    switch (importer) {
      case 'eoswinReports': return 'ISO-8859-1'
      case 'eoswinPatients': return 'WINDOWS-1252'
      case 'xdt': return 'ISO-8859-15'
    }
  }

  return new ValidatedMethod({
    name: 'importers/ingest',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: allowedImporters },
      name: { type: String },
      content: { type: String, optional: true },
      buffer: { type: Object, blackbox: true, optional: true }
    }).validator(),

    run ({ importer, name, content, buffer }) {
      this.unblock()

      if (!Meteor.userId()) { return }

      if (!importer) {
        importer = determineImporter({ name, content })
      }

      if (!content && buffer) {
        const encoding = determineEncoding({ importer })
        content = iconv.decode(Buffer.from(buffer.blob), encoding)
      }

      if (importer) {
        return {
          importer,
          result: Importers.actions.importWith.call({ importer, name, content })
        }
      } else {
        throw new Meteor.Error('no-importer-found', `Could not determine importer from filename ${name}`)
      }
    }
  })
}
