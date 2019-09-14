import { action, Match } from '../../../../util/meteor/action'
import { Events } from '../../../events'
import { Clients } from '../../../clients'
import uuidv4 from 'uuid/v4'
import { mediaTypes } from '../../schema'
import { getCredentials, createPresignedRequest } from '../s3'

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
      patientId: String,
      appointmentId: String,
      clientKey: String,
      preview: String
    },
    fn ({ width, height, takenAt, mediaType, consumerId, preview, clientKey, patientId, appointmentId }) {
      const credentials = getCredentials()

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
        patientId,
        appointmentId,
        producerId: producer._id,
        consumerId,
        createdBy: userId,
        preview
      })

      Events.post('media/insert', { mediaId, userId })

      const signed = createPresignedRequest({
        credentials,
        filename,
        method: 'PUT',
        headers: {
          'content-type': mediaType,
          'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
          'x-amz-bucket-region': credentials.region
        }
      })

      console.log(signed)

      return {
        ...signed,
        mediaType,
        filename,
        mediaId
      }
    }
  })
