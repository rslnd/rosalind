import { action, Match } from '../../util/meteor/action'
import { Events } from '../events'

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

export const actions = ({ Media }) => ({
  update: update({ Media }),
  remove: remove({ Media }),
})
