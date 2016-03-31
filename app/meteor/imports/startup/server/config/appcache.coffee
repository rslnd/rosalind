{ Meteor } = require 'meteor/meteor'

module.exports = ->
  if Meteor.AppCache
    Meteor.AppCache.config
      _disableSizeCheck: true
