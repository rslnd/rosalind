import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { Patients } from '../'
import { Comments } from '../../comments'

module.exports = ->
  Meteor.publishComposite 'patients', (ids) ->
    check(ids, Match.Optional(Array))

    return unless (@userId and Roles.userIsInRole(@userId, ['patients', 'admin'], Roles.GLOBAL_GROUP))

    @unblock()

    if ids
      {
        find: -> @unblock(); Patients.find(_id: { $in: ids })
        children: [
          { find: (doc) -> @unblock(); Comments.find(docId: doc._id) }
        ]
      }
