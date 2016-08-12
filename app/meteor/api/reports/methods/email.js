import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const email = ({ Reports }) => {
  return new ValidatedMethod({
    name: 'reports/email',

    validate: new SimpleSchema({
      _id: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ _id }) {
      Events.post('reports/email', { reportId: _id })
    }
  })
}
