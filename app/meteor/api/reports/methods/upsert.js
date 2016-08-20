import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const upsert = ({ Reports }) => {
  return new ValidatedMethod({
    name: 'reports/upsert',

    validate: new SimpleSchema({
      report: { type: Object, blackbox: true }
    }).validator(),

    run ({ report }) {
      report = Reports.methods.tally.call({ report })

      const existingReport = Reports.findOne({ day: report.day })

      if (existingReport) {
        Reports.update({ _id: existingReport._id }, { $set: report })
        Events.post('reports/upsert', { reportId: existingReport._id })
      } else {
        try {
          const reportId = Reports.insert(report, (err) => {
            if (err) { throw err }
            Events.post('reports/insert', { reportId })
          })
        } catch (e) {
          console.error('[Reports] Insert failed with error', e, 'of report', report)
        }
      }
    }
  })
}
