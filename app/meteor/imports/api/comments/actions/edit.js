import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'

export const edit = ({ Comments }) => {
  return new ValidatedMethod({
    name: 'comments/edit',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      commentId: { type: SimpleSchema.RegEx.Id },
      newBody: { type: String }
    }).validator(),
    run ({ commentId, newBody }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (newBody.length === 0) {
        return Comments.actions.remove.call({ commentId })
      }

      const comment = Comments.findOne({ _id: commentId })
      if (!comment) {
        throw new Meteor.Error(404, 'Not found')
      }

      Comments.update({ _id: commentId }, { $set: {
        body: newBody
      } })

      Meteor.call('events/post', {
        type: 'comments/edit',
        level: 'info',
        payload: { commentId, userId: Meteor.userId() }
      })
    }
  })
}
