import moment from 'moment-timezone'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { dateToDay } from 'util/time/day'
import { parseReportDate, parseReport } from 'api/reports/methods/external/eoswin/parseReport'
import { merge } from 'api/reports/methods/merge'
import { Reports } from 'api/reports'
import { Users } from 'api/users'

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
        const originalReport = Reports.findOne()
        const users = Users.find({}).fetch()
        const addendum = parseReport({ day, content, users })

        console.log('[Importers] eoswinReports: parsed addendum', addendum)

        let mergedReport
        mergedReport = merge(originalReport, addendum)

        const report = {
          ...mergedReport,
          day,
          external: {
            eoswin: {
              id: name,
              timestamps: {
                importedAp: moment().toDate(),
                importedBy: Meteor.userId()
              }
            }
          }
        }

        Reports.actions.upsert.call({ report })

        return report
      } catch (e) {
        console.error(e.message, e.stack)
      }
    }
  })
}
