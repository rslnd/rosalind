import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const post = ({ Comments }) => {
  return new ValidatedMethod({
    name: 'comments/post',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      docId: { type: SimpleSchema.RegEx.Id },
      body: { type: String }
    }).validator(),
    run ({ docId, body }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Meteor.call('events/post', {
        type: 'comments/post',
        level: 'info',
        payload: { docId, userId: Meteor.userId() }
      })

      return Comments.insert({ docId, body })
    }
  })
}
