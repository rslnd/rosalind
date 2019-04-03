import { Mongo } from 'meteor/mongo'
import { media } from './schema'

const Media = new Mongo.Collection('media')
Media.attachSchema(media)
Media.attachBehaviour('softRemovable')

export { Media }
