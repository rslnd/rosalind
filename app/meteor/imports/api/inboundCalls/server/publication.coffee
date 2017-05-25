import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { InboundCalls } from '../'
import { Comments } from '../../comments'
import Time from '../../../util/time'

module.exports = ->

  Meteor.publish null, ->
    return unless @userId

    if Roles.userIsInRole(@userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP)
      Counts.publish @, 'inboundCalls', InboundCalls.find({})
      Counts.publish @, 'inboundCalls-resolvedToday', InboundCalls.find
        removed: true
        removedAt: { $gte: Time.startOfToday() }

    return undefined

  Meteor.publishComposite 'inboundCalls', (tableName, ids, fields) ->
    check(tableName, Match.Optional(String))
    check(ids, Match.Optional(Array))
    check(fields, Match.Optional(Object))

    return unless (@userId and Roles.userIsInRole(@userId, ['inboundCalls', 'admin'], Roles.GLOBAL_GROUP))

    @unblock()

    if ids
      {
        find: ->
          @unblock()
          InboundCalls.find({ _id: { $in: ids } }, { removed: true })
        children: [
          {
            find: (doc) ->
              @unblock()
              Comments.find(docId: doc._id)
          }
        ]
      }
    else
      {
        find: -> InboundCalls.find({ removed: { $ne: true } })
        children: [
          { find: (doc) -> Comments.find(docId: doc._id) }
        ]
      }
