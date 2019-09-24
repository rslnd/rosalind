import { action, Match } from '../../../../util/meteor/action'
import { Events } from '../../../events'

export const update = ({ Media }) =>
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
    fn ({ mediaId, update }) {
      const media = Media.findOne({ _id: mediaId })
      if (!media) {
        throw new Error('Media not found')
      }

      Media.update({ _id: mediaId }, {
        $set: update
      })

      Events.post('media/update', { mediaId, update })
    }
  })
