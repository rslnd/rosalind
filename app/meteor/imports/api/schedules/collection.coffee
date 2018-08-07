import { Mongo } from 'meteor/mongo'
import methods from './methods'
import actions from './actions'
import { Schema } from './schema'

Schedules = new Mongo.Collection('schedules')
Schedules.attachSchema(Schema)
Schedules.attachBehaviour('softRemovable')
Schedules.actions = actions({ Schedules })
Schedules.methods = methods({ Schedules })

module.exports = Schedules
