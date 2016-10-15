import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { dayToDate } from 'util/time/day'
import { Events } from 'api/events'

export const upsert = ({ Reports }) => {
  return new ValidatedMethod({
    name: 'reports/upsert',

    validate: new SimpleSchema({
      report: { type: Object, blackbox: true }
    }).validator(),

    run ({ report }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      report = Reports.methods.tally.call({ report })

      const existingReport = Reports.findOne({ day: report.day })

      if (existingReport) {
        Reports.update({ _id: existingReport._id }, { $set: report })
        Events.post('reports/update', { reportId: existingReport._id })
        return existingReport._id
      } else {
        try {
          const reportId = Reports.insert(report, (err) => {
            if (err) { throw err }
            Events.post('reports/insert', { reportId })

            if (Meteor.isServer && moment().isSame(dayToDate(report.day), 'day')) {
              Meteor.call('reports/sendEmail')
            }
          })
          return reportId
        } catch (e) {
          console.error('[Reports] Insert failed with error', e, 'of report', report)
        }
      }
    }
  })
}
