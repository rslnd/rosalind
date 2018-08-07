import { Mongo } from 'meteor/mongo'
import { schema } from './schema'
import actions from './actions'
import * as methods from './methods'

const Referrals = new Mongo.Collection('referrals')

Referrals.attachSchema(schema)
Referrals.attachBehaviour('softRemovable')
Referrals.methods = methods
Referrals.actions = actions({ Referrals })

export { Referrals }
