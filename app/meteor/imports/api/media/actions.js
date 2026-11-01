import { action, Match } from '../../util/meteor/action'
import { Events } from '../events'
import { PortalMedia } from './collection'

const update = ({ Media }) =>
  action({
    name: 'media/update',
    allowAnonymous: true,
    // TODO: Restrict to trusted networks
    args: {
      mediaId: String,
      update: {
        tagIds: Match.Optional([String]),
        rotation: Match.Optional(Number)
      }
    },
    async fn ({ mediaId, update }) {
      const media = await Media.findOneAsync({ _id: mediaId })
      if (!media) {
        throw new Error('Media not found')
      }

      await Media.updateAsync({ _id: mediaId }, {
        $set: update
      })

      Events.post('media/update', { mediaId, ...update })
    }
  })

export const remove = ({ Media }) =>
  action({
    name: 'media/remove',
    roles: ['media', 'admin'],
    args: {
      mediaId: String
    },
    async fn ({ mediaId }) {
      const media = await Media.findOneAsync({ _id: mediaId })
      if (!media) {
        throw new Error('Media not found')
      }

      await Media.updateAsync({ _id: mediaId }, {
        $set: {
          removed: true,
          removedAt: new Date(),
          removedBy: this.userId
        }
      })

      Events.post('media/remove', { mediaId })
    }
  })

const portalPublish = ({ Media }) =>
  action({
    name: 'media/portalPublish',
    roles: ['media', 'admin'],
    args: {
      mediaId: String,
      b64: String
    },
    async fn ({ mediaId, b64 }) {
      const media = await Media.findOneAsync({ _id: mediaId })
      if (!media) {
        throw new Meteor.Error(404, 'Media not found')
      }

      if (await PortalMedia.findOneAsync({ mediaId })) {
        await PortalMedia.removeAsync({ mediaId })
      }

      const portalMediaId = await PortalMedia.insertAsync({
        mediaId: media._id,
        patientId: media.patientId,
        appointmentId: media.appointmentId,
        kind: media.kind,
        cycle: media.cycle,
        tagIds: media.tagIds,
        rotation: media.rotation,
        width: media.width,
        height: media.height,
        mediaType: media.mediaType,
        note: media.note,
        takenAt: media.takenAt,
        filename: media.filename,
        createdAt: media.createdAt,
        createdBy: media.createdBy,
        preview: media.preview,
        b64,
        publishedBy: this.userId,
        publishedAt: new Date()
      })

      Events.post('media/portalPublish', { mediaId, portalMediaId })

      return portalMediaId
    }
  })

const portalUnpublish = ({ Media }) =>
  action({
    name: 'media/portalUnpublish',
    roles: ['media', 'admin'],
    args: {
      mediaId: String
    },
    async fn ({ mediaId }) {
      const media = await Media.findOneAsync({ _id: mediaId })
      if (!media) {
        throw new Meteor.Error(404, 'Media not found')
      }

      const pm = await PortalMedia.findOneAsync({ mediaId })

      if (!pm) {
        throw new Meteor.Error(404, 'PortalMedia not found')
      }

      await PortalMedia.removeAsync({ mediaId })
    }
  })

export const actions = ({ PortalMedia, Media }) => ({
  update: update({ Media }),
  remove: remove({ Media }),
  portalPublish: portalPublish({ PortalMedia, Media }),
  portalUnpublish: portalUnpublish({ PortalMedia, Media }),
})
