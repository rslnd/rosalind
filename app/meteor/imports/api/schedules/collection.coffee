import { Mongo } from 'meteor/mongo'
import methods from './methods'
import actions from './actions'
import helpers from './helpers'
import { Schema } from './schema'

Schedules = new Mongo.Collection('schedules')
Schedules.attachSchema(Schema)
Schedules.attachBehaviour('softRemovable')
Schedules.helpers(helpers)
Schedules.helpers({ collection: -> Schedules })
Schedules.actions = actions({ Schedules })
Schedules.methods = methods({ Schedules })

module.exports = Schedules
