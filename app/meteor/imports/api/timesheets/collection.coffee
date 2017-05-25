import { Mongo } from 'meteor/mongo'
import helpers from './helpers'
import methods from './methods'
import actions from './actions'
import Schema from './schema'

Timesheets = new Mongo.Collection('timesheets')
Timesheets.attachSchema(Schema)
Timesheets.helpers(helpers)
Timesheets.helpers({ collection: -> Timesheets })
Timesheets.methods = methods({ Timesheets })
Timesheets.actions = actions({ Timesheets })

module.exports = Timesheets
