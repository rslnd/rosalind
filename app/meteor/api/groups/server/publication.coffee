{ Meteor } = require 'meteor/meteor'
{ Groups } = require 'api/groups'

module.exports = ->
  Meteor.publish 'groups', ->
    Groups.find({}) if @userId
