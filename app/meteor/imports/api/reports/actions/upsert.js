import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { daySelector } from '../../../util/time/day'
import { Events } from '../../events'

export const upsert = ({ Reports }) => {
  return new ValidatedMethod({
    name: 'reports/upsert',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      report: { type: Object, blackbox: true }
    }).validator(),

    async run ({ report }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      const existingReport = await Reports.findOneAsync({
        calendarId: report.calendarId,
        ...daySelector(report.day)
      })

      if (existingReport) {
        await Reports.updateAsync({ _id: existingReport._id }, { $set: report })
        Events.post('reports/update', { reportId: existingReport._id })
        return existingReport._id
      } else {
        try {
          const reportId = await Reports.insertAsync(report)
          Events.post('reports/insert', { reportId })
          return reportId
        } catch (e) {
          console.error('[Reports] Insert failed with error', e)
        }
      }
    }
  })
}
