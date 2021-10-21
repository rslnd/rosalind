import { Mongo } from 'meteor/mongo'
import { media, mediaTags, portalMedia } from './schema'
import { lifecycleActions } from '../../util/meteor/action'
import { actions } from './actions'

const PortalMedia = new Mongo.Collection('portalMedia')
PortalMedia.attachSchema(portalMedia)

if (Meteor.isServer) {
  const publishedFor = 86400 * 14 // 14 days
  Meteor.startup(() => {
    PortalMedia._ensureIndex({ publishedAt: 1 }, { expireAfterSeconds: publishedFor })
  })
}

const Media = new Mongo.Collection('media')
Media.attachSchema(media)
Media.actions = actions({ Media, PortalMedia })
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

export { Media, MediaTags, PortalMedia }
