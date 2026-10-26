// Plain-JS port of the original CoffeeScript soft-removable behaviour.
// Compatible with aldeed:collection2@4 (aldeed:simple-schema@1.13.x wrapper)
// and matb33:collection-hooks@2 (Meteor 2.16 + 3.x).
//
// NOTE (Meteor 3 behaviour change): collection-hooks v2 fires `before.find`
// only for the async cursor reads (fetchAsync/countAsync/forEachAsync) and no
// longer for `findOne`/`findOneAsync`. Soft-removed documents are therefore
// still hidden from find().fetchAsync()/count, but a direct findOne lookup will
// return a soft-removed document. Add an explicit `{ removed: { $exists: false } }`
// where a findOne must exclude soft-removed docs.
import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import { CollectionBehaviours } from 'meteor/zimme:collection-behaviours'

const defaults = {
  removed: 'removed',
  removedAt: 'removedAt',
  removedBy: 'removedBy',
  restoredAt: 'restoredAt',
  restoredBy: 'restoredBy',
  systemId: '0'
}

function behaviour (options = {}) {
  check(options, Object)

  const { removed, removedAt, removedBy, restoredAt, restoredBy, systemId } =
    Object.assign({}, defaults, this.options, options)

  const collection = this.collection

  // Extend the schema with the soft-remove bookkeeping fields.
  const idRegEx = new RegExp(`(${SimpleSchema.RegEx.Id.source})|^${systemId}$`)
  const definition = {}

  definition[removed] = { optional: true, type: Boolean }

  if (removedAt) {
    definition[removedAt] = { denyInsert: true, optional: true, type: Date }
  }
  if (removedBy) {
    definition[removedBy] = { denyInsert: true, optional: true, regEx: idRegEx, type: String }
  }
  if (restoredAt) {
    definition[restoredAt] = { denyInsert: true, optional: true, type: Date }
  }
  if (restoredBy) {
    definition[restoredBy] = { denyInsert: true, optional: true, regEx: idRegEx, type: String }
  }

  collection.attachSchema(new SimpleSchema(definition))

  // Hide soft-removed documents from cursor reads unless explicitly requested.
  // Must be synchronous (collection-hooks v2 forbids async before.find hooks).
  collection.before.find(function (userId, selector, options) {
    if (!selector || typeof selector === 'string') { return }

    if (Match.test(selector, Object) &&
        !(options && options.removed) &&
        selector[removed] === undefined) {
      selector[removed] = { $exists: false }
    }
  })

  // Translate $set/$unset of the `removed` flag into the full bookkeeping.
  collection.before.update(function (userId = systemId, doc, fieldNames, modifier, options) {
    const $set = (modifier.$set = modifier.$set || {})
    const $unset = (modifier.$unset = modifier.$unset || {})

    if ($set[removed] && doc[removed] != null) { return false }
    if ($unset[removed] && doc[removed] == null) { return false }

    if ($set[removed] && doc[removed] == null) {
      $set[removed] = true
      if (removedAt) { $set[removedAt] = new Date() }
      if (removedBy) { $set[removedBy] = userId }
      if (restoredAt) { $unset[restoredAt] = true }
      if (restoredBy) { $unset[restoredBy] = true }
    }

    if ($unset[removed] && doc[removed] != null) {
      $unset[removed] = true
      if (removedAt) { $unset[removedAt] = true }
      if (removedBy) { $unset[removedBy] = true }
      if (restoredAt) { $set[restoredAt] = new Date() }
      if (restoredBy) { $set[restoredBy] = userId }
    }

    if (Object.keys($set).length === 0) { delete modifier.$set }
    if (Object.keys($unset).length === 0) { delete modifier.$unset }
  })

  const isLocalCollection = collection._connection === null

  // Soft-remove / restore. Async in Meteor 3 (updateAsync); callers must await.
  collection.softRemove = async function (selector, callback) {
    if (!selector) { return 0 }

    const modifier = { $set: {} }
    modifier.$set[removed] = true

    try {
      if (Meteor.isServer || isLocalCollection) {
        return await this.updateAsync(selector, modifier, { multi: true }, callback)
      }
      return await this.updateAsync(selector, modifier, callback)
    } catch (error) {
      if (error && error.reason && error.reason.indexOf('Not permitted.') !== -1) {
        throw new Meteor.Error(403, 'Not permitted. Untrusted code may only ' +
          'softRemove documents by ID.')
      }
      throw error
    }
  }

  collection.restore = async function (selector, callback) {
    if (!selector) { return 0 }

    const modifier = { $unset: {} }
    modifier.$unset[removed] = true

    try {
      if (Meteor.isServer || isLocalCollection) {
        selector = Object.assign({}, selector, { [removed]: true })
        return await this.updateAsync(selector, modifier, { multi: true }, callback)
      }
      return await this.updateAsync(selector, modifier, callback)
    } catch (error) {
      if (error && error.reason && error.reason.indexOf('Not permitted.') !== -1) {
        throw new Meteor.Error(403, 'Not permitted. Untrusted code may only ' +
          'restore documents by ID.')
      }
      throw error
    }
  }
}

CollectionBehaviours.define('softRemovable', behaviour)
