import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'

export const post = ({ Comments }) => {
  return new ValidatedMethod({
    name: 'comments/post',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      docId: { type: SimpleSchema.RegEx.Id },
      body: { type: String }
    }).validator(),
    async run ({ docId, body }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      await Meteor.callAsync('events/post', {
        type: 'comments/post',
        level: 'info',
        payload: { docId, userId: Meteor.userId() }
      })

      return await Comments.insertAsync({ docId, body })
    }
  })
}
