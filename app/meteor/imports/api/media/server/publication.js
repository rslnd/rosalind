import { publish } from '../../../util/meteor/publish'
import { getCredentials, createPresignedRequests, requestToUrl } from './s3'

export const publication = ({ Media, MediaTags }) => {
  publish({
    name: 'media',
    roles: ['media'],
    args: {
      patientId: String
    },
    fn: function ({ patientId }) {
      const selector = { patientId }

      // Attach derived field on documents before publishing
      const credentials = getCredentials()

      const transform = doc => {
        if (credentials) {
          const requests = createPresignedRequests({
            credentials,
            filename: doc.filename,
            signQuery: true
          })

          doc.urls = requests.map(r => requestToUrl(r))
          doc.url = doc.urls[0] // LEGACY
        }
        return doc
      }

      const observer = Media.find(selector).observe({
        added: doc =>
          this.added('media', doc._id, transform(doc)),
        changed: (newDoc, oldDoc) =>
          this.changed('media', newDoc._id, transform(newDoc)),
        removed: oldDoc =>
          this.removed('media', oldDoc._id)
      })

      this.onStop(function () {
        observer.stop()
      })

      this.ready()
    }
  })

  publish({
    name: 'media-tags',
    roles: ['media'],
    fn: function () {
      return MediaTags.find({})
    }
  })
}
