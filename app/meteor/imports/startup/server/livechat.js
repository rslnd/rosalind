import jwt from 'jsonwebtoken'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Meteor } from 'meteor/meteor'

export default () => {
  return new ValidatedMethod({
    name: 'livechat/init',

    validate: new SimpleSchema({
      smoochUserId: { type: String }
    }).validator(),

    run ({ smoochUserId }) {
      if (!Meteor.user()) { return }

      return jwt.sign(
        {
          scope: 'appUser',
          userId: smoochUserId
        },
        process.env.SMOOCH_SECRET,
        {
          header: { kid: process.env.SMOOCH_KEY_ID }
        }
      )
    }
  })
}
