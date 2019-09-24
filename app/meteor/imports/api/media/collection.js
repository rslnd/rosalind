import { Mongo } from 'meteor/mongo'
import { media, mediaTags } from './schema'

const Media = new Mongo.Collection('media')
Media.attachSchema(media)
Media.attachBehaviour('softRemovable')

const MediaTags = new Mongo.Collection('mediaTags')
MediaTags.attachSchema(mediaTags)
MediaTags.attachBehaviour('softRemovable')

export { Media, MediaTags }
