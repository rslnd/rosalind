{ Mongo } = require 'meteor/mongo'
helpers = require './helpers'
Schema = require './schema'

InboundCalls = new Mongo.Collection('inboundCalls')
InboundCalls.attachSchema(Schema)
InboundCalls.attachBehaviour('softRemovable')
InboundCalls.helpers(helpers)
InboundCalls.helpers({ collection: -> InboundCalls })

module.exports = InboundCalls
