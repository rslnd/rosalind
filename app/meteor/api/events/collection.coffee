{ Mongo } = require 'meteor/mongo'
Schema = require './schema'

Events = new Mongo.Collection('events')
Events._createCappedCollection(1024 * 1024 * 4) if Meteor.isServer
Events.attachSchema(Schema)

module.exports = Events
