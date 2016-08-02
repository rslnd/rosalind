import moment from 'moment'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const isTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/isTracking',

    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ userId }) {
      return Timesheets.findOne({
        userId,
        start: { $gt: moment().startOf('day').toDate() },
        tracking: true
      })
    }
  })
}
