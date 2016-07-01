import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'

export default ({ Events }) => {
  const methods = {
    post (args) {
      check(args, {
        type: String,
        level: Match.Optional(String),
        payload: Match.Optional(Object)
      })

      console.log(`[Event] ${args.level}: ${args.type}`, { payload: args.payload })

      if (!Meteor.userId() && !args.payload.userId) { return }
      if (Object.keys(args.payload).length === 0) { args.payload = null }

      Events.insert({
        type: args.type,
        level: args.level || 'info',
        createdBy: Meteor.userId() || args.payload.userId,
        createdAt: new Date(),
        payload: args.payload
      })
    }
  }

  Meteor.methods({ 'events/post': methods.post })

  return methods
}
