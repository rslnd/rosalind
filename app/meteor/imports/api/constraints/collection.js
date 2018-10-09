import { Mongo } from 'meteor/mongo'
import { Schema } from './schema'

const Constraints = new Mongo.Collection('constraints')
Constraints.attachSchema(Schema)
Constraints.attachBehaviour('softRemovable')

export default Constraints
