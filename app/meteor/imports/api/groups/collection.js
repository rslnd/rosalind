import { Mongo } from 'meteor/mongo'
import Schema from './schema'

const Groups = new Mongo.Collection('groups')
Groups.attachSchema(Schema)
Groups.attachBehaviour('softRemovable')

export default Groups
