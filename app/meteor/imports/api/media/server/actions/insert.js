import { action, Match } from '../../../../util/meteor/action'
import { Events } from '../../../events'
import { Clients } from '../../../clients'
import { sign } from 'aws4'
import uuidv4 from 'uuid/v4'
import { mediaTypes } from '../../schema'

const bucket = 'rslnd-media-dev'
const region = 'at-vie-1'
const host = [bucket, '.', 'sos-', region, '.exo.io'].join('')

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
      clientKey: String
    },
    fn ({ width, height, takenAt, mediaType, consumerId, clientKey }) {
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
        createdBy: userId
      })

      Events.post('media/insert', { mediaId, userId })

      const path = '/' + filename
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
        mediaType,
        filename
      }
    }
  })
