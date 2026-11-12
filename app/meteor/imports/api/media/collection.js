import { Mongo } from 'meteor/mongo'
import { media, mediaTags } from './schema'
import { lifecycleActions } from '../../util/meteor/action'
import { actions } from './actions'

const Media = new Mongo.Collection('media')
Media.attachSchema(media)
Media.actions = actions({ Media })
Media.attachBehaviour('softRemovable')

const MediaTags = new Mongo.Collection('mediaTags')
MediaTags.attachSchema(mediaTags)
MediaTags.attachBehaviour('softRemovable')
MediaTags.actions = lifecycleActions({
  Collection: MediaTags,
  plural: 'mediaTags',
  singular: 'mediaTag',
  roles: ['admin', 'media-tags-edit']
})

export { Media, MediaTags }
