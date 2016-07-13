import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

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

    run ({ lastName, firstName, telephone, note, privatePatient }) {
      InboundCalls.insert({ lastName, firstName, telephone, note, privatePatient })

      console.log('[InboundCalls] Inserted', { lastName, firstName, telephone, note, privatePatient })
    }
  })
}
