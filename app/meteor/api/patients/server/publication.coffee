{ Meteor } = require 'meteor/meteor'
{ Mongo } = require 'meteor/mongo'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ Patients, Comments } = require 'api'

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
