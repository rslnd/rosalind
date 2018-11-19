import { Mongo } from 'meteor/mongo'
import methods from './methods'
import { inboundCalls, inboundCallsTopics } from './schema'

const InboundCalls = new Mongo.Collection('inboundCalls')
InboundCalls.attachSchema(inboundCalls)
InboundCalls.attachBehaviour('softRemovable')
InboundCalls.methods = methods({ InboundCalls })

const InboundCallsTopics = new Mongo.Collection('inboundCallsTopics')
InboundCallsTopics.attachSchema(inboundCallsTopics)
InboundCallsTopics.attachBehaviour('softRemovable')

export { InboundCalls, InboundCallsTopics }
