import { Meteor } from 'meteor/meteor'
import { processJournal, mapUserIds } from '../../../../reports/methods/external/eoswin'
import { Reports } from '../../../../reports'
import { Users } from '../../../../users'
import { Patients } from '../../../../patients'
import { Appointments } from '../../../../appointments'
import { deduplicateWithJournal } from '../../../../patients/methods/deduplicateWithJournal'
import { action, Match } from '../../../../../util/meteor/action'

export const eoswinJournalReports = ({ Importers }) => {
  return action({
    name: 'importers/eoswinJournalReports',
    args: {
      importer: 'eoswinJournalReports',
      name: String,
      content: String
    },
    allowAnonymous: true,
    run ({ name, content }) {
      try {
        if (Meteor.isServer) {
          const { isTrustedNetwork } = require('../../../../customer/isTrustedNetwork')
          if (!this.userId && (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
            throw new Meteor.Error(403, 'Not authorized')
          }
        }

        const mapIds = mapUserIds({ Users })

        deduplicateWithJournal({ Appointments, Patients, journal: content })

        const addendum = processJournal(mapIds)(content, name)
        Reports.actions.generate.call({ day: addendum.day, addendum })
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
