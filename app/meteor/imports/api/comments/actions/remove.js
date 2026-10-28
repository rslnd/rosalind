import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CallPromiseMixin } from '../../../util/meteor/callPromiseMixin'
import { Events } from '../../events'

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

      Events.post('comments/remove', { commentId, userId: Meteor.userId() })

      return await Comments.softRemove(commentId)
    }
  })
}
