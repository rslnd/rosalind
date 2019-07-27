import { Mongo } from 'meteor/mongo'
import Schema from './schema'
import { actions } from './actions'

const Groups = new Mongo.Collection('groups')
Groups.attachSchema(Schema)
Groups.attachBehaviour('softRemovable')
Groups.actions = actions({ Groups })

export default Groups
