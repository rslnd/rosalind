import { Mongo } from 'meteor/mongo'
import Schema from './schema'
import methods from './methods'

Comments = new Mongo.Collection('comments')
Comments.attachSchema(Schema)
Comments.attachBehaviour('softRemovable')
Comments.helpers({ collection: -> Comments })
Comments.methods = methods({ Comments })

module.exports = Comments
