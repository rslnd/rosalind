import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { Counts } from 'meteor/tmeasday:publish-counts'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'
import { Comments } from '../../comments'
import { Patients } from '../../patients'
import Appointments from '../collection'

module.exports = ->
  Meteor.publish null, ->
    return unless @userId

    if Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP)
      Counts.publish @, 'appointments', Appointments.methods.findOpen()

    return undefined

  Meteor.publishComposite 'appointment', (_id) ->
    check _id, Match.Optional(String)
    return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))

    @unblock()

    {
      find: ->
        @unblock()
        Appointments.find({ _id }, { limit: 1 })

      children: [
        { find: (doc) -> @unblock(); Comments.find(docId: doc._id) }
        { find: (doc) -> @unblock(); Patients.find({ _id: doc.patientId }, { limit: 1 }) if doc.patientId }
      ]
    }



  Meteor.publishComposite 'appointments', (options = {}) ->
    check options, Match.Optional
      date: Match.Optional(Date)
      start: Match.Optional(Date)
      end: Match.Optional(Date)
      within: Match.Optional(String)

    return unless (@userId and Roles.userIsInRole(@userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP)) or
      (@connection and isTrustedNetwork(@connection.clientAddress))

    options ||= {}
    options.within ||= 'day'

    # If no argument are supplied, publish future appointments
    if (not options.date and not options.start and not options.end)
      options.start = moment().startOf(options.within).toDate()
      options.end = moment().add(6, 'months').endOf(options.within).toDate()
    else
      options.date ||= new Date()
      unless (options.start and options.end)
        options.start = moment(options.date).startOf(options.within).toDate()
        options.end = moment(options.date).endOf(options.within).toDate()

    @unblock()

    {
      find: ->
        @unblock()
        selector =
          start:
            $gte: options.start
            $lte: options.end
          removed: { $ne: true }

        cursor = Appointments.find(selector, { sort: { start: 1 } })

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

    return Appointments.find({
      patientId: options.patientId,
      removed: { $ne: true }
    }, {
      sort: { start: 1 }
    })


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
