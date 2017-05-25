import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { dateToDay } from '../../../../../util/time/day'
import { parseReportDate, parseAddendum } from '../../../../reports/methods/external/eoswin/parseAddendum'
import { Reports } from '../../../../reports'
import { Users } from '../../../../users'

export const eoswinReports = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/eoswinReports',

    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: [ 'eoswinReports' ] },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ name, content }) {
      if (this.isSimulation) { return }
      if (!Meteor.userId()) { return }

      const day = dateToDay(parseReportDate(name))

      Reports.actions.generate.call({ day })

      try {
        const users = Users.find({}).fetch()
        const addendum = [parseAddendum({ day, content, users })]

        console.log('[Importers] eoswinReports: parsed addendum', addendum)

        Reports.actions.generate.call({ day, addendum })
      } catch (e) {
        console.error(e.message, e.stack)
      }
    }
  })
}
