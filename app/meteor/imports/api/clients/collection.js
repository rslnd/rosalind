import { Mongo } from 'meteor/mongo'
import { schema } from './schema'
import { actions } from './actions'

const Clients = new Mongo.Collection('clients')

Clients.attachSchema(schema)
Clients.helpers({ collection: () => Clients })
Clients.actions = actions({ Clients })

export default Clients
