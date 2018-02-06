import { Mongo } from 'meteor/mongo'
import { schema } from './schema'
import actions from './actions'

const Referrals = new Mongo.Collection('referrals')

Referrals.attachSchema(schema)
Referrals.attachBehaviour('softRemovable')
Referrals.helpers({ collection: () => Referrals })
Referrals.actions = actions({ Referrals })

export { Referrals }
