import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { check, Match } from 'meteor/check'

export const action = ({ name, args = {}, roles, fn }) => {
  if (!name) {
    throw new Error('Action needs a name')
  }

  return new ValidatedMethod({
    name,
    mixins: [CallPromiseMixin],
    validate (unsafeArgs = {}) {
      check(unsafeArgs, args)
    },
    run: function (safeArgs) {
      // Validate clientKey and permissions
      // if (this.connection && !this.userId) {
      //   throw new Meteor.Error(403, 'Not authorized')
      // }

      return fn.call(this, safeArgs)
    }
  })
}
