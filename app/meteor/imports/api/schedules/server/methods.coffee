{ Meteor } = require 'meteor/meteor'
{ Jobs } = require '/imports/api/jobs'

module.exports = ->
  Meteor.methods
    'schedules/updateCache': ->
      return unless Meteor.userId()

      new Job(Jobs.Cache, 'schedules', {}).save()
