{ Meteor } = require 'meteor/meteor'
{ Groups } = require '/imports/api/groups'

module.exports = ->
  Meteor.publish 'groups', ->
    Groups.find({}) if @userId
