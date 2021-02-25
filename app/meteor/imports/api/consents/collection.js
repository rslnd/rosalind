import { Mongo } from 'meteor/mongo'
import { schema } from './schema'
import { actions } from './actions'

const Consents = new Mongo.Collection('consents')

Consents.attachSchema(schema)
Consents.attachBehaviour('softRemovable')
Consents.actions = actions({ Consents })

export { Consents }
