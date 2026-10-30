// Plain-JS port of the original CoffeeScript behaviours framework.
// Provides CollectionBehaviours.define() and Mongo.Collection#attachBehaviour().
import { Mongo } from 'meteor/mongo'
import { check, Match } from 'meteor/check'

const definedBehaviours = {}

const messages = {
  attachAborted: (name, collectionName) =>
    `Attach aborted, behaviour "${name}" already attached to ${collectionName} collection`,
  attachFailed: (name) =>
    `Attach failed, behaviour "${name}" not found`
}

// Attach one or more behaviours to the collection bound as `this`.
function attach (behaviours, ...options) {
  // Single named behaviour, e.g. attachBehaviour('softRemovable')
  if (Match.test(behaviours, String)) {
    const name = behaviours.toLowerCase()
    const behaviourObject = definedBehaviours[name]

    if (!behaviourObject) {
      console.error(messages.attachFailed(name))
      return
    }

    behaviourObject.collections = behaviourObject.collections || []

    if (behaviourObject.collections.includes(this._name)) {
      console.warn(messages.attachAborted(name, this._name))
      return
    }

    const context = {
      collection: this,
      options: behaviourObject.options || {}
    }

    behaviourObject.behaviour.apply(context, options)
    behaviourObject.collections.push(this._name)
    return
  }

  // Inline behaviour function
  if (Match.test(behaviours, Function)) {
    const context = { collection: this, options: {} }
    behaviours.apply(context, options)
    return
  }

  // Object map { behaviourName: options }
  if (Match.test(behaviours, Object)) {
    for (const name of Object.keys(behaviours)) {
      const options = behaviours[name]
      const key = name.toLowerCase()
      const behaviourObject = definedBehaviours[key]

      if (!behaviourObject) {
        console.error(messages.attachFailed(key))
        continue
      }

      behaviourObject.collections = behaviourObject.collections || []

      if (behaviourObject.collections.includes(this._name)) {
        console.warn(messages.attachAborted(key, this._name))
        continue
      }

      const context = {
        collection: this,
        options: behaviourObject.options || {}
      }

      behaviourObject.behaviour.call(context, options)
      behaviourObject.collections.push(this._name)
    }
    return
  }

  console.error('Attach failed, unknown reason')
}

const CollectionBehaviours = {
  configure (nameOrObject, options) {
    check(nameOrObject, Match.OneOf(Object, String))
    check(options, Match.Optional(Object))

    if (Match.test(nameOrObject, String)) {
      check(options, Object)
      const tmp = {}
      tmp[nameOrObject] = options
      nameOrObject = tmp
    }

    for (const name of Object.keys(nameOrObject)) {
      const key = name.toLowerCase()
      const behaviourObject = definedBehaviours[key]
      if (behaviourObject) {
        behaviourObject.options = nameOrObject[name]
      } else {
        console.error(`Configure failed, behaviour "${key}" not found`)
      }
    }
  },

  config (...args) {
    return this.configure(...args)
  },

  define (name, behaviour, options) {
    check(name, String)
    check(behaviour, Function)
    check(options, Match.Optional(Match.ObjectIncluding({ replace: Boolean })))

    const key = name.toLowerCase()
    const behaviourObject = definedBehaviours[key]

    if (behaviourObject && !(options && options.replace)) {
      console.warn('Behaviour already defined, use {replace: true} to override')
    } else {
      definedBehaviours[key] = { behaviour }
    }
  }
}

Mongo.Collection.prototype.attachBehaviour = function (...args) {
  const objectOrString = Match.OneOf(Object, String)
  check(args[0], Match.OneOf(objectOrString, [objectOrString]))
  return attach.apply(this, args)
}

export { CollectionBehaviours }
