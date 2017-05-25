import { Mongo } from 'meteor/mongo'
import helpers from './helpers'
import methods from './methods'
import Schema from './schema'

InboundCalls = new Mongo.Collection('inboundCalls')
InboundCalls.attachSchema(Schema)
InboundCalls.attachBehaviour('softRemovable')
InboundCalls.helpers(helpers)
InboundCalls.helpers({ collection: -> InboundCalls })
InboundCalls.methods = methods({ InboundCalls })

module.exports = InboundCalls
