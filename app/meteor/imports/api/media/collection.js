import { Mongo } from 'meteor/mongo'
import actions from './actions'
import { media } from './schema'

const Media = new Mongo.Collection('media')
Media.attachSchema(media)
Media.attachBehaviour('softRemovable')
Media.actions = actions({ Media })

export { Media }
