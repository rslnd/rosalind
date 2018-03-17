import { Mongo } from 'meteor/mongo'
import { schema } from './schema'

const Clients = new Mongo.Collection('clients')

Clients.attachSchema(schema)
Clients.helpers({ collection: () => Clients })

export default Clients
