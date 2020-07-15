import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin'
import { check, Match } from 'meteor/check'
import { hasRole } from './hasRole'
import { isAllowed } from './isAllowed'

export { Match }

export const action = ({ name, args = {}, roles, allowAnonymous, requireClientKey, simulation = true, fn }) => {
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
        if (!hasRole(this.userId, roles)) {
          throw new Meteor.Error(403, 'Not authorized')
        }
      }

      if (!simulation && this.isSimulation) {
        return
      }

      if (isAllowed({
        allowAnonymous,
        requireClientKey,
        connection: this.connection,
        userId: this.userId,
        clientKey: safeArgs.clientKey,
        roles
      })) {
        return fn.call(this, safeArgs)
      } else {
        console.error('[action] Denying', name, 'to user', this.userId)
        throw new Meteor.Error(403, 'Not authorized')
      }
    }
  })
}

// Macro to add insert/update/softRemove actions
export const lifecycleActions = ({
  Collection,
  singular,
  plural,
  roles,
  actions = ['insert', 'update', 'softRemove']
}) => {
  check(singular, String)
  check(plural, String)
  check(roles, [String])
  check(actions, [String])

  if (!Collection) {
    throw new Error('Need to pass a Collection instance to lifecycleActions')
  }

  return {
    insert: actions.includes('insert') && action({
      name: `${plural}/insert`,
      roles,
      args: {
        [singular]: Object
      },
      fn: function (a) {
        const _id = Collection.insert(a[singular])
        console.log(`[${plural}] insert (lifecycle) ${_id} by ${this.userId}`)
        return _id
      }
    }),
    update: actions.includes('update') && action({
      name: `${plural}/update`,
      roles,
      args: {
        [`${singular}Id`]: String,
        update: Object
      },
      fn: function (a) {
        Collection.update({ _id: a[`${singular}Id`] }, a.update)
        console.log(`[${plural}] update (lifecycle) ${a[`${singular}Id`]} by ${this.userId}`)
      }
    }),
    softRemove: actions.includes('softRemove') && action({
      name: `${plural}/softRemove`,
      roles,
      args: {
        [`${singular}Id`]: String
      },
      fn: function (a) {
        Collection.softRemove({ _id: a[`${singular}Id`] })
        console.log(`[${plural}] softRemove (lifecycle) ${a[`${singular}Id`]} by ${this.userId}`)
      }
    })
  }
}
