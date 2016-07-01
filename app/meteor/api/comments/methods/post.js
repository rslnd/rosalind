import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

export default ({ Comments }) => {
  const methods = {
    post (args) {
      check(args, {
        docId: String,
        body: String
      })

      Meteor.call('events/post', {
        type: 'comments/post',
        level: 'info',
        payload: { docId: args.docId, userId: Meteor.userId() }
      })

      Comments.insert({ docId: args.docId, body: args.body })
    }
  }

  Meteor.methods({ 'comments/post': methods.post })

  return methods
}
