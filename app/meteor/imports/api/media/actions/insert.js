import { action } from '../../../util/meteor/action'
import { Meteor } from 'meteor/meteor'
import { Events } from '../../events'
import { Clients } from '../../clients'

export const insert = ({ Media }) =>
  action({
    name: 'media/insert',
    allowAnonymous: true,
    // TODO: Restrict to trusted networks
    args: {
      width: Number,
      height: Number,
      takenAt: Date,
      mimeType: String,
      consumerId: String
    },
    fn ({ width, height, takenAt, mimeType, consumerId }) {
      const consumer = Clients.findOne({ _id: consumerId })
      if (!consumer) { throw new Error(`Could not find consumer with id ${consumerId}`) }
      const userId = consumer.pairedBy

      const mediaId = Media.insert({ width, height, takenAt, mimeType, consumerId })

      Events.post('media/insert', { mediaId, userId })

      // create signed upload url
      return mediaId
    }
  })
