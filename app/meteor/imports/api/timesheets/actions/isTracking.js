import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const isTracking = ({ Timesheets }) => {
  return new ValidatedMethod({
    name: 'timesheets/isTracking',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      userId: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ userId }) {
      return Timesheets.methods.isTracking({ userId })
    }
  })
}
