{ Meteor } = require 'meteor/meteor'

module.exports =
  createdAt: ->
    return new Date() if @isInsert
    return { $setOnInsert: new Date() } if @isUpsert
    @unset()

  createdBy: ->
    try
      return Meteor.userId() if @isInsert
      return { $setOnInsert: Meteor.userId() } if @isUpsert
      @unset()
    catch
      @unset()
