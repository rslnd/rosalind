import { action, Match } from '../../../../util/meteor/action'
import { Events } from '../../../events'
import { Clients } from '../../../clients'
import { hasRole } from '../../../../util/meteor/hasRole'

export const uploadComplete = ({ Media }) =>
  action({
    name: 'media/uploadComplete',
    allowAnonymous: true,
    // TODO: Restrict to trusted networks
    args: {
      mediaId: String,
      clientKey: Match.Optional(String)
    },
    async fn ({ mediaId, clientKey }) {
      if (clientKey) {
        const producer = await Clients.findOneAsync({ clientKey })
        if (!producer) {
          throw new Error('Could not find producer by clientKey')
        }
      } else {
        if (!this.userId && await hasRole(this.userId, ['media', 'admin'])) {
          throw new Error('Not authorized')
        }
      }

      const media = await Media.findOneAsync({ _id: mediaId })
      if (!media) {
        throw new Error('Media not found')
      }

      await Media.updateAsync({ _id: mediaId }, {
        $set: {
          uploadCompletedAt: new Date()
        }
      })

      Events.post('media/uploadComplete', { mediaId })
    }
  })
