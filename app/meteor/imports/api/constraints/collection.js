import { Mongo } from 'meteor/mongo'
import { Schema } from './schema'
import { lifecycleActions } from '../../util/meteor/action'

const Constraints = new Mongo.Collection('constraints')
Constraints.attachSchema(Schema)
Constraints.attachBehaviour('softRemovable')
Constraints.actions = lifecycleActions({
  Collection: Constraints,
  singular: 'constraint',
  plural: 'constraints',
  roles: ['admin', 'constraints-edit']
})

export default Constraints
