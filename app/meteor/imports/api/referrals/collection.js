import { Mongo } from 'meteor/mongo'
import { referrals, referrables } from './schema'
import actions from './actions'
import * as methods from './methods'

const Referrables = new Mongo.Collection('referrables')
Referrables.attachSchema(referrables)
Referrables.attachBehaviour('softRemovable')

const Referrals = new Mongo.Collection('referrals')
Referrals.attachSchema(referrals)
Referrals.attachBehaviour('softRemovable')

Referrals.methods = methods
Referrals.actions = actions({ Referrals, Referrables })

export { Referrals, Referrables }
