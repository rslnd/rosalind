import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'

export const unresolve = ({ InboundCalls }) => {
  return new ValidatedMethod({
    name: 'inboundCalls/unresolve',
    mixins: [CallPromiseMixin],

    validate: new SimpleSchema({
      _id: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run ({ _id }) {
      await InboundCalls.restore(_id)
      Events.post('inboundCalls/unresolve', { _id })
    }
  })
}
