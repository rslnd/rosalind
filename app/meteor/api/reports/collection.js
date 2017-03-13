import { Mongo } from 'meteor/mongo'
import methods from './methods'
import Schema from './schema'

let Reports = new Mongo.Collection('reports')
Reports.attachSchema(Schema)
Reports.helpers({ collection: () => Reports })
Reports.methods = methods({ Reports })

export default Reports
