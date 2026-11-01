import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'

export const findOne = ({ Patients }) => {
  return new ValidatedMethod({
    name: 'patients/findOne',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      _id: { type: SimpleSchema.RegEx.Id }
    }).validator(),

    async run ({ _id }) {
      this.unblock()

      if (this.connection && !this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      return await Patients.findOneAsync({ _id })
    }
  })
}
