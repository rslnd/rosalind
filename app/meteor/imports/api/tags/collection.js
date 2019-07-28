import { Mongo } from 'meteor/mongo'
import methods from './methods'
import { actions } from './actions'
import Schema from './schema'

const Tags = new Mongo.Collection('tags')

Tags.attachSchema(Schema)
Tags.attachBehaviour('softRemovable')
Tags.methods = methods({ Tags })
Tags.actions = actions({ Tags })

export default Tags
