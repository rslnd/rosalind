import { Mongo } from 'meteor/mongo'
import helpers from './helpers'
import methods from './methods'
import Schema from './schema'

Groups = new Mongo.Collection('groups')
Groups.attachSchema(Schema)
Groups.attachBehaviour('softRemovable')
Groups.helpers(helpers)
Groups.helpers({ collection: -> Groups })
Groups.methods = methods(Groups)

module.exports = Groups
