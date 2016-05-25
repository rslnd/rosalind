{ Meteor } = require 'meteor/meteor'
{ Jobs } = require '/imports/api/jobs'

module.exports = ->
  Meteor.methods
    'schedules/updateCache': (date) ->
      return unless Meteor.userId()

      check(date, Match.Optional(Date))

      new Job(Jobs.cache, 'schedules', { date }).save()
