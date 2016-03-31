{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ Counts } = require 'meteor/tmeasday:publish-counts'
{ Appointments, Comments } = require '/imports/api'

module.exports = ->
  Meteor.publish null, ->
    return unless @userId

    if Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP)
      Counts.publish @, 'appointments', Appointments.methods.findOpen()

    return undefined


  Meteor.publishComposite 'appointments', (tableName, ids, fields) ->
    check(tableName, Match.Optional(String))
    check(ids, Match.Optional(Array))
    check(fields, Match.Optional(Object))

    return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))

    @unblock()

    if ids
      {
        find: ->
          @unblock()
          Appointments.find({ _id: { $in: ids } }, { removed: true, sort: { start: 1 } })
        children: [
          { find: (doc) -> @unblock(); Comments.find(docId: doc._id) }
        ]
      }
    else
      {
        find: (date) -> Appointments.find({
          start:
            $gte: moment(date).startOf('day').toDate()
            $lte: moment(date).endOf('day').toDate()
        }, {
          sort: { start: 1 }
        })

        children: [
          { find: (doc) -> Comments.find(docId: doc._id) }
          { find: (doc) -> Patients.find({ _id: doc.patientId }, { limit: 1 }) if doc.patientId?._str }
        ]
      }
