import { Mongo } from 'meteor/mongo'
import methods from './methods'
import Schema from './schema'

InboundCalls = new Mongo.Collection('inboundCalls')
InboundCalls.attachSchema(Schema)
InboundCalls.attachBehaviour('softRemovable')
InboundCalls.methods = methods({ InboundCalls })

module.exports = InboundCalls
