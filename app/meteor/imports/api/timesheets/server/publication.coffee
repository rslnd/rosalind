{ Meteor } = require 'meteor/meteor'
{ Timesheets } = require '/imports/api/timesheets'

module.exports = ->
  Meteor.publish 'timesheets', ->
    return unless @userId

    Timesheets.find { userId: @userId },
      limit: 20
      sort: { end: -1 }
