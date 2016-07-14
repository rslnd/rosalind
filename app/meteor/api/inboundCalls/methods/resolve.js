import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const resolve = ({ InboundCalls }) => {
  return new ValidatedMethod({
    name: 'inboundCalls/resolve',

    validate: new SimpleSchema({
      _id: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ _id }) {
      InboundCalls.softRemove(_id)
      Events.post('inboundCalls/resolve', { _id })
    }
  })
}
