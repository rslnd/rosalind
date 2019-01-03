import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { Roles } from 'meteor/alanning:roles'
import { check, Match } from 'meteor/check'

export { Match }

export const action = ({ name, args = {}, roles, allowAnonymous, simulation = true, fn }) => {
  if (!name) {
    throw new Error('Action needs a name')
  }

  if ((!roles || roles.length === 0) && !allowAnonymous) {
    throw new Error(`Action ${name} needs an array of roles, or allowAnonymous: true`)
  }

  return new ValidatedMethod({
    name,
    mixins: [CallPromiseMixin],
    validate (unsafeArgs = {}) {
      const argsWithClientKey = {
        clientKey: Match.Optional(String),
        ...args
      }
      check(unsafeArgs, argsWithClientKey)
    },
    run: function (safeArgs) {
      if (!allowAnonymous) {
        if (!Roles.userIsInRole(this.userId, roles, Roles.GLOBAL_GROUP)) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      }

      if (!simulation && this.isSimulation) {
        return
      }

      // Validate clientKey and permissions
      // if (this.connection && !this.userId) {
      //   throw new Meteor.Error(403, 'Not authorized')
      // }

      return fn.call(this, safeArgs)
    }
  })
}
