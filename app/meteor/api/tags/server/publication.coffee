{ Meteor } = require 'meteor/meteor'
{ Tags } = require 'api/tags'

module.exports = ->
  Meteor.publish 'tags', ->
    Tags.find({}) if @userId
