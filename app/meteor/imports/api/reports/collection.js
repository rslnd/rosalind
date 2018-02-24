import { Mongo } from 'meteor/mongo'
import actions from './actions'
import Schema from './schema'
import * as fields from './fields'

let Reports = new Mongo.Collection('reports')
Reports.attachSchema(Schema)
Reports.helpers({ collection: () => Reports })
Reports.actions = actions({ Reports })
Reports.fields = fields

export default Reports
