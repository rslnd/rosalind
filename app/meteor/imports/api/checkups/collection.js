import { Mongo } from 'meteor/mongo'
import methods from './methods'
import { checkups, checkupsRules } from './schema'
import { lifecycleActions } from '../../util/meteor/action'

const Checkups = new Mongo.Collection('checkups')
Checkups.attachSchema(checkups)
Checkups.attachBehaviour('softRemovable')

const CheckupsRules = new Mongo.Collection('checkupsRules')
CheckupsRules.actions = lifecycleActions({
  Collection: CheckupsRules,
  singular: 'checkupsRule',
  plural: 'checkupsRules',
  roles: ['admin', 'checkups', 'checkups-edit', 'checkups-rules-edit']
})
CheckupsRules.attachSchema(checkupsRules)
CheckupsRules.attachBehaviour('softRemovable')

Checkups.methods = methods({ Checkups, CheckupsRules })

export { Checkups, CheckupsRules }
