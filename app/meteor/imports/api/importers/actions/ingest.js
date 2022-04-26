import iconv from 'iconv-lite'
import { Meteor } from 'meteor/meteor'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { allowedImporters } from '../allowedImporters'
import { action, Match } from '../../../util/meteor/action'

export const ingest = ({ Importers }) => {
  const determineImporter = ({ name, content }) => {
    if (name && name.includes('Ärzte Statistik Umsätze')) { return 'eoswinRevenueReports' }
    if (name && name.match(/\.PAT$/i)) { return 'eoswinPatients' }
    if (name && name.match(/\.json$/i)) { return 'genericJson' }
    if (name && name.match(/(\.gdt)$|(\.bdt$)|(\.xdt$)|(\.001)/i)) { return 'xdt' }
    if (content && content.match(/Online Konsultation mit e-card/i)) { return 'eoswinJournalReports' }
    if (content && content.match(/Krankenscheine gesamt/i) && content.match(/Abrechnungsgruppe/i)) { return 'eoswinRevenueReports' }
  }

  const determineEncoding = ({ importer }) => {
    switch (importer) {
      case 'eoswinRevenueReports': return 'ISO-8859-1'
      case 'eoswinJournalReports': return 'ISO-8859-1'
      case 'eoswinPatients': return 'WINDOWS-1252'
      case 'xdt': return 'ISO-8859-15'
      case 'genericJson': return 'utf8'
    }
  }

  return action({
    name: 'importers/ingest',
    args: {
      name: String,
      importer: Match.Maybe(Match.OneOf(undefined, null, ...allowedImporters)),
      content: Match.Maybe(Match.OneOf(undefined, null, String)),
      base64: Match.Maybe(Match.OneOf(undefined, null, String))
    },
    allowAnonymous: true,
    fn ({ importer, name, content, base64 }) {
      try {
        if (Meteor.isServer) {
          const { isTrustedNetwork } = require('../../customer/isTrustedNetwork')
          if (!this.userId && (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
            throw new Meteor.Error(403, 'Not authorized')
          }
        }

        if (this.isSimulation) {
          return
        }

        if (!importer) {
          if (!content && base64) {
            content = iconv.decode(Buffer.from(base64, 'base64'), 'utf8')
          }
          importer = determineImporter({ name, content })
        }

        if (!content && base64) {
          const encoding = determineEncoding({ importer })
          if (!encoding) throw new Meteor.Error('encoding-not-recognized', `Could not determine encoding for ${name}`)
          content = iconv.decode(Buffer.from(base64, 'base64'), encoding)
        }

        if (importer) {
          return {
            importer,
            result: Importers.actions.importWith.call({ importer, name, content })
          }
        } else {
          throw new Meteor.Error('no-importer-found', `Could not determine importer for ${name}`)
        }
      } catch (e) {
        console.error(e)
      }
    }
  })
}
