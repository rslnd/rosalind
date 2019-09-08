import { action, Match } from '../../../../util/meteor/action'
import { Events } from '../../../events'
import { Clients } from '../../../clients'
import { sign } from 'aws4'
import uuidv4 from 'uuid/v4'
import { mediaTypes } from '../../schema'

const bucket = 'hzw-media'
const region = 'hzw-onprem'
const host = '10.0.0.15:9000'
const scheme = 'http'

if (process.env.NODE_ENV === 'production' && scheme !== 'https') {
  throw new Error('Connection to S3 must be encrypted in production')
}

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
      consumerId: String,
      clientKey: String,
      preview: String
    },
    fn ({ width, height, takenAt, mediaType, consumerId, preview, clientKey }) {
      const producer = Clients.findOne({ clientKey })
      if (!producer) { throw new Error(`Could not find producer by clientKey`) }
      if (!producer.pairedTo) { throw new Error(`Producer is not paired to any consumer`) }
      if (producer.pairedTo !== consumerId) { throw new Error(`Pairing ids do not match`) }

      const consumer = Clients.findOne({ _id: consumerId })
      if (!consumer) { throw new Error(`Could not find consumer with id ${consumerId}`) }

      const userId = producer.pairedBy
      if (!userId) { throw new Error(`No userId found in pairing`) }

      const filename = [
        uuidv4(), // Keep v4 instead of v5 becuase v4 is random
        '.jpeg'
      ].join('')

      const mediaId = Media.insert({
        filename,
        width,
        height,
        takenAt,
        mediaType,
        producerId: producer._id,
        consumerId,
        createdBy: userId,
        preview
      })

      Events.post('media/insert', { mediaId, userId })

      const accessKeyId = process.env.AWS_ACCESS_KEY_ID
      const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
      if (!accessKeyId || !secretAccessKey) {
        throw new Error('Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY')
      }

      // create presigned upload url
      const path = '/' + bucket + '/' + filename
      const url = scheme + '://' + host + path
      const signed = sign({
        service: 's3',
        region,
        url,
        path,
        method: 'PUT',
        host,
        headers: {
          'content-type': mediaType,
          'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
          'x-amz-bucket-region': region
        }
      }, { accessKeyId, secretAccessKey })

      console.log(signed)

      return {
        ...signed,
        url,
        mediaType,
        filename
      }
    }
  })
