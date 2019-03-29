import { Mongo } from 'meteor/mongo'
import { referrals, referrables } from './schema'
import actions from './actions'
import * as methods from './methods'

const Referrals = new Mongo.Collection('referrals')

Referrals.attachSchema(referrals)
Referrals.attachBehaviour('softRemovable')
Referrals.methods = methods
Referrals.actions = actions({ Referrals })

const Referrables = new Mongo.Collection('referrables')
Referrables.attachSchema(referrables)
Referrables.attachBehaviour('softRemovable')

export { Referrals, Referrables }
