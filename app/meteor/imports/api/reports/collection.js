import { Mongo } from 'meteor/mongo'
import actions from './actions'
import Schema from './schema'

let Reports = new Mongo.Collection('reports')
Reports.attachSchema(Schema)
Reports.helpers({ collection: () => Reports })
Reports.actions = actions({ Reports })

export default Reports
