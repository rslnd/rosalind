import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { allowedImporters } from '../../../allowedImporters'
import { dateToDay } from 'util/time/day'
import { parseReportDate, parseReport } from './parseReport'
import { Reports } from 'api/reports'
import { Users } from 'api/users'

export const eoswinReports = ({ Importers }) => {
  return new ValidatedMethod({
    name: 'importers/eoswinReports',

    validate: new SimpleSchema({
      importer: { type: String, optional: true, allowedValues: allowedImporters },
      name: { type: String },
      content: { type: String }
    }).validator(),

    run ({ name, content }) {
      if (!Meteor.userId()) { return }

      const day = dateToDay(parseReportDate(name))
      let { assignees } = parseReport(content)

      assignees.map((assignee) => {
        if (assignee.external && assignee.external.eoswin.id) {
          const user = Users.findOne({ 'external.eoswin.id': assignee.external.eoswin.id })
          if (user) {
            assignee.userId = user._id
          }
        }
        return assignee
      })

      const report = {
        day,
        assignees,
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

      return Reports.methods.upsert.call({ report })
    }
  })
}
