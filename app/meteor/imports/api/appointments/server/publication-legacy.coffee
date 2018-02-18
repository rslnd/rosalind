import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Roles } from 'meteor/alanning:roles'
import { Counts } from 'meteor/tmeasday:publish-counts'
import { isTrustedNetwork } from '../../customer/server/isTrustedNetwork'
import { Comments } from '../../comments'
import { Patients } from '../../patients'
import Appointments from '../collection'

module.exports = ->
  Meteor.publishComposite 'appointments-legacy', (options = {}) ->
    check options, Match.Optional
      date: Match.Optional(Date)
      start: Match.Optional(Date)
      end: Match.Optional(Date)
      within: Match.Optional(String)

    return unless (this.userId and Roles.userIsInRole(this.userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP)) or
      (this.connection and isTrustedNetwork(this.connection.clientAddress))

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

    this.unblock()

    {
      find: ->
        this.unblock()
        selector =
          start:
            $gte: options.start
            $lte: options.end
          removed: { $ne: true }

        cursor = Appointments.find(selector, { sort: { start: 1 } })

        return cursor

      children: [
        { find: (doc) -> this.unblock(); Comments.find(docId: doc._id) }
        { find: (doc) -> this.unblock(); Patients.find({ _id: doc.patientId }, { limit: 1 }) if doc.patientId }
      ]
    }


  Meteor.publishComposite 'appointmentsPatient', (options = {}) ->
    check options,
      patientId: String

    return unless (this.userId and Roles.userIsInRole(this.userId, ['appointments', 'admin'], Roles.GLOBAL_GROUP))

    {
      find: -> Appointments.find({
        patientId: options.patientId,
      }, {
        sort: { start: 1 },
        removed: true
      }),
      children: [
        { find: (doc) -> this.unblock(); Comments.find(docId: options.patientId) }
        { find: (doc) -> this.unblock(); Comments.find(docId: doc._id) }
      ]
    }
