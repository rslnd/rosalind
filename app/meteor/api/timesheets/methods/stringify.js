import moment from 'moment'
import { TAPi18n } from 'meteor/tap:i18n'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const stringify = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/stringify',

    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ userId }) {
      const selector = {
        userId,
        start: { $gt: moment().startOf('day').toDate() }
      }

      const firstTimesheet = Timesheets.find(selector, {
        sort: { start: 1 },
        limit: 1
      }).fetch()[0]

      const lastTimesheet = Timesheets.find(selector, {
        sort: { start: -1 },
        limit: 1
      }).fetch()[0]

      if (!firstTimesheet) { return null }

      const isTracking = Timesheets.methods.isTracking.call({ userId })

      const start = firstTimesheet.start
      const end = !isTracking && lastTimesheet.end

      return `${moment(start).format('H:mm')}-${end ? moment(end).format('H:mm') : TAPi18n.__('timesheets.now')}`
    }
  })
}
