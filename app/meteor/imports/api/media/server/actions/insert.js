import idx from 'idx'
import { action, Match } from '../../../../util/meteor/action'
import { Events } from '../../../events'
import { Clients } from '../../../clients'
import { v4 as uuidv4 } from 'uuid'
import uniq from 'lodash/uniq'
import identity from 'lodash/identity'
import { mediaTypes, kinds } from '../../schema'
import { getCredentials, createPresignedRequests } from '../s3'
import { hasRole } from '../../../../util/meteor/hasRole'
import { Appointments } from '../../../appointments'

export const insert = ({ Media, MediaTags }) =>
  action({
    name: 'media/insert',
    allowAnonymous: true,
    // TODO: Restrict to trusted networks
    args: {
      width: Number,
      height: Number,
      takenAt: Date,
      kind: Match.OneOf(...kinds),
      mediaType: Match.OneOf(...mediaTypes),
      consumerId: Match.Maybe(String),
      patientId: String,
      appointmentId: Match.Maybe(Match.OneOf(undefined, null, String)),
      cycle: Match.Maybe(Match.OneOf(undefined, null, String)),
      tagIds: Match.Maybe(Match.OneOf(undefined, null, [String], [])),
      clientKey: Match.Optional(String),
      preview: Match.Optional(String),
      nonce: Match.Optional(String)
    },
    fn: function ({ width, height, takenAt, kind, mediaType, consumerId, preview, clientKey, patientId, appointmentId, cycle, tagIds, nonce }) {
      let userId = null
      let producerId = null

      if (clientKey && consumerId) {
        const producer = Clients.findOne({ clientKey })
        if (!producer) { throw new Error('Could not find producer by clientKey') }
        if (!producer.pairedTo) { throw new Error('Producer is not paired to any consumer') }
        if (producer.pairedTo !== consumerId) { throw new Error('Pairing ids do not match') }
        producerId = producer._id
        const consumer = Clients.findOne({ _id: consumerId })
        if (!consumer) { throw new Error(`Could not find consumer with id ${consumerId}`) }
        userId = producer.pairedBy
      } else {
        userId = this.userId
        if (!userId || !hasRole(userId, ['documents', 'documents-insert', 'media', 'media-insert', 'admin'])) {
          throw new Error('Authentication failed or permission denied')
        }
      }

      if (!userId) { throw new Error('No userId found in pairing or meteor auth') }

      if (preview && !preview.match(/^data:image\//)) {
        throw new Error(`Invalid preview URL, needs to start with data:image: ${preview.substr(0, 50)}`)
      }

      const existingMedia = (nonce && nonce.length >= 20)
        ? Media.findOne({ nonce })
        : false

      if (existingMedia) {
        console.log(`media/insert: Received insert for existing media ${existingMedia._id}`)
      }

      const filename = existingMedia
        ? existingMedia.filename
        : [
          uuidv4(), // Keep v4 instead of v5 becuase v4 is random
          '.jpeg'
        ].join('')


      // Automatically append photos to newest cycle if not given, and
      // set consumer's current cycle to that new cycle so that subsequent media gets appended too
      if (!cycle && kind === 'photo') {
        const consumer = Clients.findOne({ _id: consumerId })
        if (consumer.nextMedia && consumer.nextMedia.cycle !== null) {
          console.error('Producer sent no cycle, but consumer has cycle selected. Appending to currently selected cycle', { producerId, consumerId, filename })
          cycle = consumer.nextMedia.cycle
        } else if (consumer.nextMedia && consumer.nextMedia.patientId) {
          const medias = Media.find({ patientId }, { sort: { createdAt: -1 } }).fetch()
          const uniqueCycles = uniq(medias.map(m => m.cycle).filter(identity))
          const newCycleNr = String(uniqueCycles.length + 1)
          Clients.update({ _id: consumer._id }, { $set: { 'nextMedia.cycle': newCycleNr }})
          cycle = newCycleNr
        }
      }

      // Documents do not have cycles
      if (kind === 'document') {
        cycle = null

        // documents with pinned tags are global for the patient
        if (tagIds.some(t => idx(MediaTags.findOne({ _id: t }), _ => _.pinned))) {
          appointmentId = null
        }
      }

      // TODO // BUG: photos don't have tags initially, until there is a way
      // to know when a (batch) scan of documents with tags has finished.
      // note that photos may be taken while a document is being scanned
      if (kind === 'photo') {
        tagIds = []
      }



      const mediaId = existingMedia
        ? existingMedia._id
        : Media.insert({
          filename,
          width,
          height,
          takenAt,
          kind,
          mediaType,
          patientId,
          appointmentId,
          producerId,
          cycle,
          tagIds,
          consumerId,
          createdBy: userId,
          preview,
          nonce
        })

      if (!existingMedia) {
        Events.post('media/insert', { mediaId, userId })
      } else {
        Events.post('media/insert/existing', { mediaId, userId })
      }

      // Create multiple presigned requests as fallbacks, the app will try to upload to one of them starting, with the first
      const credentials = getCredentials()
      const signed = createPresignedRequests({
        credentials,
        filename,
        method: 'PUT',
        headers: {
          'content-type': mediaType,
          'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
        }
      })

      const presignedRequests = signed.map(p => ({
        ...p,
        mediaType,
        filename,
        mediaId
      }))

      // If this media is a consent document, create a reference to this media in the corresponding appointment's consentMediaIds field
      const consentTag = MediaTags.findOne({ isConsent: true })
      if (appointmentId &&
        kind === 'document' &&
        consentTag &&
        tagIds.indexOf(consentTag._id) !== -1
      ) {
        Appointments.update({ _id: appointmentId }, {
          $addToSet: {
            consentMediaIds: mediaId
          }
        })
      }

      return presignedRequests
    }
  })
