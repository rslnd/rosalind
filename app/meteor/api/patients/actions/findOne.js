import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const findOne = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/findOne',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      _id: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    run ({ _id }) {
      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      return Patients.findOne({ _id }, { fields: {
        '_id': 1,
        'profile.lastName': 1,
        'profile.firstName': 1,
        'profile.gender': 1,
        'profile.birthday': 1
      }})
    }
  })
}
