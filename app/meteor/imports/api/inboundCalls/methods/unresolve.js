import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from '../../events'

export const unresolve = ({ InboundCalls }) => {
  return new ValidatedMethod({
    name: 'inboundCalls/unresolve',

    validate: new SimpleSchema({
      _id: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ _id }) {
      InboundCalls.restore(_id)
      Events.post('inboundCalls/unresolve', { _id })
    }
  })
}
