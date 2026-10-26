import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'

export const edit = ({ Comments }) => {
  return new ValidatedMethod({
    name: 'comments/edit',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      commentId: { type: SimpleSchema.RegEx.Id },
      newBody: { type: String }
    }).validator(),
    async run ({ commentId, newBody }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      if (newBody.length === 0) {
        return await Comments.actions.remove.callPromise({ commentId })
      }

      const comment = await Comments.findOneAsync({ _id: commentId })
      if (!comment) {
        throw new Meteor.Error(404, 'Not found')
      }

      await Comments.updateAsync({ _id: commentId }, { $set: {
        body: newBody
      } })

      await Meteor.callAsync('events/post', {
        type: 'comments/edit',
        level: 'info',
        payload: { commentId, userId: Meteor.userId() }
      })
    }
  })
}
