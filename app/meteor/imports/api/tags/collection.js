import { Mongo } from 'meteor/mongo'
import methods from './methods'
import Schema from './schema'

const Tags = new Mongo.Collection('tags')

Tags.attachSchema(Schema)
Tags.attachBehaviour('softRemovable')
Tags.methods = methods({ Tags })

export default Tags
