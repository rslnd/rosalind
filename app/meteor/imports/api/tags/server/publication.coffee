{ Meteor } = require 'meteor/meteor'
{ Tags } = require '/imports/api/tags'

module.exports = ->
  Meteor.publish 'tags', ->
    Tags.find({}) if @userId
