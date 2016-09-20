{ Meteor } = require 'meteor/meteor'
{ check } = require 'meteor/check'
{ Roles } = require 'meteor/alanning:roles'
{ Counts } = require 'meteor/tmeasday:publish-counts'
{ Comments } = require 'api/comments'
{ Patients } = require 'api/patients'
Appointments = require '../collection'

module.exports = ->
  Meteor.publish null, ->
    return unless @userId

    if Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP)
      Counts.publish @, 'appointments', Appointments.methods.findOpen()

    return undefined


  Meteor.publishComposite 'appointments', (options = {}) ->
    check options, Match.Optional
      date: Match.Optional(Date)
      start: Match.Optional(Date)
      end: Match.Optional(Date)
      within: Match.Optional(String)

    options.within ||= 'day'
    options.date ||= new Date()
    unless (options.start and options.end)
      options.start = moment(options.date).startOf(within).toDate()
      options.end = moment(options.date).endOf(within).toDate()


    return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))

    @unblock()

    {
      find: ->
        @unblock()
        selector = start:
          $gte: options.start
          $lte: options.end
        cursor = Appointments.find(selector, { sort: { start: 1 } })
        console.log('[Appointments] Publishing', {
          count: cursor.count(),
          date: options.date,
          within: options.within,
          start: options.start,
          end: options.end,
          userId: @userId
        })
        return cursor

      children: [
        { find: (doc) -> @unblock(); Comments.find(docId: doc._id) }
        { find: (doc) -> @unblock(); Patients.find({ _id: doc.patientId }, { limit: 1 }) if doc.patientId }
      ]
    }


  Meteor.publish 'appointmentsPatient', (options = {}) ->
    check options,
      patientId: String

    return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))

    return Appointments.find({ patientId: options.patientId }, { sort: { start: 1 } })


  Meteor.publishComposite 'appointmentsTable', (tableName, ids, fields) ->
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
        find: (date) ->
          @unblock()
          Appointments.find({
            start:
              $gte: moment(date).startOf('day').toDate()
              $lte: moment(date).endOf('day').toDate()
          }, {
            sort: { start: 1 }
          })

        children: [
          { find: (doc) -> @unblock(); Comments.find(docId: doc._id) }
          { find: (doc) -> @unblock(); Patients.find({ _id: doc.patientId }, { limit: 1 }) if doc.patientId }
        ]
      }
