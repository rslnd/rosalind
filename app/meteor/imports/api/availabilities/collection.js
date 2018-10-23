import { Mongo } from 'meteor/mongo'
import { schema } from './schema'
import { actions } from './actions'

const Availabilities = new Mongo.Collection('availabilities')

Availabilities.attachSchema(schema)
Availabilities.attachBehaviour('softRemovable')
Availabilities.actions = actions({ Availabilities })

export { Availabilities }
