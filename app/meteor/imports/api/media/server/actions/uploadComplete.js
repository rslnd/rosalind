import { action, Match } from '../../../../util/meteor/action'
import { Events } from '../../../events'
import { Clients } from '../../../clients'

export const uploadComplete = ({ Media }) =>
  action({
    name: 'media/uploadComplete',
    allowAnonymous: true,
    // TODO: Restrict to trusted networks
    args: {
      mediaId: String,
      clientKey: String
    },
    fn ({ mediaId, clientKey }) {
      const producer = Clients.findOne({ clientKey })
      if (!producer) {
        throw new Error(`Could not find producer by clientKey`)
      }

      const media = Media.findOne({ _id: mediaId })
      if (!media) {
        throw new Error('Media not found')
      }

      Media.update({ _id: mediaId }, {
        $set: {
          uploadCompletedAt: new Date()
        }
      })

      Events.post('media/uploadComplete', { mediaId })
    }
  })
