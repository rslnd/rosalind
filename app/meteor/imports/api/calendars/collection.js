import { Mongo } from 'meteor/mongo'
import { schema } from './schema'
import { actions } from './actions'

const Calendars = new Mongo.Collection('calendars')

Calendars.attachSchema(schema)
Calendars.attachBehaviour('softRemovable')
Calendars.actions = actions({ Calendars })

export { Calendars }
