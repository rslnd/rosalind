import { Mongo } from 'meteor/mongo'
import methods from './methods'
import actions from './actions'
import Schema from './schema'

Timesheets = new Mongo.Collection('timesheets')
Timesheets.attachSchema(Schema)
Timesheets.methods = methods({ Timesheets })
Timesheets.actions = actions({ Timesheets })

module.exports = Timesheets
