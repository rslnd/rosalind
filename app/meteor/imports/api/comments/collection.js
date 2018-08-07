import { Mongo } from 'meteor/mongo'
import Schema from './schema'
import actions from './actions'

const Comments = new Mongo.Collection('comments')
Comments.attachSchema(Schema)
Comments.attachBehaviour('softRemovable')
Comments.actions = actions({ Comments })

export default Comments
