import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { processRevenue, mapUserIds } from '../../../../reports/methods/external/eoswin'
import { Reports } from '../../../../reports'
import { Users } from '../../../../users'

export const eoswinRevenueReports = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/eoswinRevenueReports',

    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: [ 'eoswinRevenueReports' ] },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ name, content }) {
      this.unblock()
      try {
        if (Meteor.isServer) {
          const { isTrustedNetwork } = require('../../../../customer/server/isTrustedNetwork')
          if (!this.userId || (this.connection && !isTrustedNetwork(this.connection.clientAddress))) {
            throw new Meteor.Error(403, 'Not authorized')
          }
        }

        if (this.isSimulation) {
          return
        }

        const mapIds = mapUserIds({ Users })

        const addendum = processRevenue(mapIds)(content, name)
        Reports.actions.generate.call({ day: addendum.day, addendum })
      } catch (e) {
        console.error(e.message, e.stack)
        throw e
      }
    }
  })
}
