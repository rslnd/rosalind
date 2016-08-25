import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Events } from 'api/events'

export const post = ({ InboundCalls }) => {
  return new ValidatedMethod({
    name: 'inboundCalls/post',

    validate: new SimpleSchema({
      lastName: { type: String },
      firstName: { type: String, optional: true },
      telephone: { type: String, optional: true },
      note: { type: String, optional: true },
      privatePatient: { type: Boolean, optional: true }
    }).validator(),

    run (data) {
      const _id = InboundCalls.insert(data)
      Events.post('inboundCalls/post', { _id })
      return _id
    }
  })
}
