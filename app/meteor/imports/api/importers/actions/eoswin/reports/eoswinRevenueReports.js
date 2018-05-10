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
        if (this.isSimulation) { return }
        if (!Meteor.userId()) { return }

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
