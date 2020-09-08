import { Mongo } from 'meteor/mongo'
import methods from './methods'
import { inboundCalls, inboundCallsTopics } from './schema'
import { lifecycleActions } from '../../util/meteor/action'

const InboundCalls = new Mongo.Collection('inboundCalls')
InboundCalls.attachSchema(inboundCalls)
InboundCalls.attachBehaviour('softRemovable')

const InboundCallsTopics = new Mongo.Collection('inboundCallsTopics')
InboundCallsTopics.actions = lifecycleActions({
  Collection: InboundCallsTopics,
  singular: 'inboundCallsTopic',
  plural: 'inboundCallsTopics',
  roles: ['admin', 'inboundCallsTopics-edit']
})
InboundCallsTopics.attachSchema(inboundCallsTopics)
InboundCallsTopics.attachBehaviour('softRemovable')

InboundCalls.methods = methods({ InboundCalls, InboundCallsTopics })

export { InboundCalls, InboundCallsTopics }
