import { action, Match } from '../../../util/meteor/action'
import { Events } from '../../events'
import { Clients } from '../../clients'
import { sign } from 'aws4'
import { mediaTypes } from '../schema'

export const insert = ({ Media }) =>
  action({
    name: 'media/insert',
    allowAnonymous: true,
    // TODO: Restrict to trusted networks
    args: {
      width: Number,
      height: Number,
      takenAt: Date,
      mediaType: Match.OneOf(...mediaTypes),
      consumerId: String
    },
    fn ({ width, height, takenAt, mediaType, consumerId }) {
      const consumer = Clients.findOne({ _id: consumerId })
      if (!consumer) { throw new Error(`Could not find consumer with id ${consumerId}`) }
      const userId = consumer.pairedBy

      const mediaId = Media.insert({
        width,
        height,
        takenAt,
        mediaType,
        consumerId,
        createdBy: userId
      })

      Events.post('media/insert', { mediaId, userId })

      const bucket = 'rslnd-media-dev'
      const region = 'at-vie-1'
      const host = [bucket, '.', 'sos-', region, '.exo.io'].join('')

      const path = [
        '/file.jpeg'
      ].join('')
      const url = ['https://', host, path].join('')

      const accessKeyId = process.env.AWS_ACCESS_KEY_ID
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
      if (!accessKeyId || !secretAccessKey) {
        throw new Error('Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY')
      }

      // create presigned upload url
      const signed = sign({
        service: 's3',
        region,
        url,
        path,
        method: 'PUT',
        host,
        headers: {
          'content-type': mediaType,
          'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
        }
      }, { accessKeyId, secretAccessKey })

      console.log(signed)

      return {
        ...signed,
        url,
        mediaType
      }
    }
  })
