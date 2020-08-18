import { Mongo } from 'meteor/mongo'
import actions from './actions'
import { Schema } from './schema'

let Templates = new Mongo.Collection('templates')
Templates.attachSchema(Schema)
Templates.attachBehaviour('softRemovable')
Templates.actions = actions({ Templates })

export default Templates
