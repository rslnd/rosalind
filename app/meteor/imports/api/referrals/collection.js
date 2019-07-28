import { Mongo } from 'meteor/mongo'
import { referrals, referrables } from './schema'
import actions from './actions'
import * as methods from './methods'
import { lifecycleActions } from '../../util/meteor/action'

const Referrables = new Mongo.Collection('referrables')
Referrables.attachSchema(referrables)
Referrables.attachBehaviour('softRemovable')
Referrables.actions = lifecycleActions({
  Collection: Referrables,
  singular: 'referrable',
  plural: 'referrables',
  roles: ['admin', 'referrables-edit']
})

const Referrals = new Mongo.Collection('referrals')
Referrals.attachSchema(referrals)
Referrals.attachBehaviour('softRemovable')

Referrals.methods = methods
Referrals.actions = actions({ Referrals, Referrables })

export { Referrals, Referrables }
