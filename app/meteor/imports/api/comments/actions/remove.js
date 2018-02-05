import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const remove = ({ Comments }) => {
  return new ValidatedMethod({
    name: 'comments/remove',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      commentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),
    run ({ commentId }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      Meteor.call('events/post', {
        type: 'comments/remove',
        level: 'info',
        payload: { commentId, userId: Meteor.userId() }
      })

      return Comments.softRemove(commentId)
    }
  })
}
