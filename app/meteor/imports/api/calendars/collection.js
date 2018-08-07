import { Mongo } from 'meteor/mongo'
import { schema } from './schema'

const Calendars = new Mongo.Collection('calendars')

Calendars.attachSchema(schema)
Calendars.attachBehaviour('softRemovable')

export { Calendars }
