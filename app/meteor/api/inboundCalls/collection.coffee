{ Mongo } = require 'meteor/mongo'
helpers = require './helpers'
methods = require './methods'
Schema = require './schema'

InboundCalls = new Mongo.Collection('inboundCalls')
InboundCalls.attachSchema(Schema)
InboundCalls.attachBehaviour('softRemovable')
InboundCalls.helpers(helpers)
InboundCalls.helpers({ collection: -> InboundCalls })
InboundCalls.methods = methods({ InboundCalls })

module.exports = InboundCalls
