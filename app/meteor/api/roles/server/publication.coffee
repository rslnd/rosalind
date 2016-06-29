{ Meteor } = require 'meteor/meteor'

module.exports = ->
  Meteor.publish null, ->
    Meteor.roles.find({}) if @userId
