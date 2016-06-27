{ Mongo } = require 'meteor/mongo'
Schema = require './schema'
methods = require './methods'

Comments = new Mongo.Collection('comments')
Comments.attachSchema(Schema)
Comments.attachBehaviour('softRemovable')
Comments.helpers({ collection: -> Comments })
Comments.methods = methods.default({ Comments })

module.exports = Comments
