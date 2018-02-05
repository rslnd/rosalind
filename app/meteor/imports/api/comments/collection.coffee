import { Mongo } from 'meteor/mongo'
import Schema from './schema'
import actions from './actions'

Comments = new Mongo.Collection('comments')
Comments.attachSchema(Schema)
Comments.attachBehaviour('softRemovable')
Comments.helpers({ collection: -> Comments })
Comments.actions = actions({ Comments })

module.exports = Comments
