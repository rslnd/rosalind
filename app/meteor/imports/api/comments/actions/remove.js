import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'

export const remove = ({ Comments }) => {
  return new ValidatedMethod({
    name: 'comments/remove',
    mixins: [CallPromiseMixin],
    validate: new SimpleSchema({
      commentId: { type: SimpleSchema.RegEx.Id }
    }).validator(),
    async run ({ commentId }) {
      if (!this.userId) {
        throw new Meteor.Error(403, 'Not authorized')
      }

      await Meteor.callAsync('events/post', {
        type: 'comments/remove',
        level: 'info',
        payload: { commentId, userId: Meteor.userId() }
      })

      return await Comments.softRemove(commentId)
    }
  })
}
