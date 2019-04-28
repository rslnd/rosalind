import { Mongo } from 'meteor/mongo'
import { schema } from './schema'
import { actions } from './actions'

export const Records = new Mongo.Collection('records')
Records.attachSchema(schema)
Records.attachBehaviour('softRemovable')
Records.actions = actions({ Records })
