import { Mongo } from 'meteor/mongo'
import methods from './methods'
import Schema from './schema'

Groups = new Mongo.Collection('groups')
Groups.attachSchema(Schema)
Groups.attachBehaviour('softRemovable')
Groups.methods = methods(Groups)

module.exports = Groups
