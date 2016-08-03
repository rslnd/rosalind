{ Meteor } = require 'meteor/meteor'
{ Mongo } = require 'meteor/mongo'
methods = require './methods'
Schema = require './schema'

Events = new Mongo.Collection('events')
Events._createCappedCollection(1024 * 1024 * 4) if Meteor.isServer
Events.attachSchema(Schema)
Events.methods = methods({ Events })

# Shortcut method
Events.post = (type, payload, level = 'info') ->
  Events.methods.post.call({ type, payload, level })

module.exports = Events
