import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export const post = ({ Events }) => {
  return new ValidatedMethod({
    name: 'events/post',

    validate: new SimpleSchema({
      type: { type: String },
      level: { type: String, optional: true },
      payload: { type: Object, blackbox: true, optional: true }
    }).validator(),

    run ({ type, level, payload }) {
      console.log(`[Event] ${level || 'info'}: ${type}`, { payload: payload })

      if (!Meteor.userId() && !payload.userId) { return }
      if (Object.keys(payload).length === 0) { payload = null }

      Events.insert({
        type: type,
        level: level || 'info',
        createdBy: Meteor.userId() || payload.userId,
        createdAt: new Date(),
        payload: payload
      })
    }
  })
}
