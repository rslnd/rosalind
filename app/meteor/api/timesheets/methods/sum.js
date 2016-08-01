import moment from 'moment'
import add from 'lodash/sum'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const sum = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/sum',

    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ userId }) {
      const timesheets = Timesheets.find({
        userId,
        start: { $gt: moment().subtract(1, 'day').toDate() }
      })
      return add(timesheets.map((t) => t.duration()))
    }
  })
}
