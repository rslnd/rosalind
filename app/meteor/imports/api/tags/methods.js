import { Meteor } from 'meteor/meteor'
import fromPairs from 'lodash/fromPairs'
import some from 'lodash/fp/some'
import identity from 'lodash/identity'

export default ({ Tags }) => {
  // Maps Tag ids to reporting categories, eg.:
  //   { 'fe2r9qedo': 'surgery' }
  const getMappingForReports = async () => {
    const tags = await Tags.find().fetchAsync()

    return fromPairs(tags.map((tag) => {
      return [ tag._id, tag.reportAs || null ]
    }))
  }

  // Client: synchronous (reactive minimongo) so it can be used in trackers/render.
  // Server: async (no synchronous Mongo on the server); server callers await.
  const expand = Meteor.isServer
    ? async (tags = []) =>
      (await Promise.all(tags.map(async t =>
        typeof t === 'string'
          ? await Tags.findOneAsync({ _id: t }, { sort: { order: 1 }, removed: true })
          : t
      ))).filter(identity)
    : (tags = []) =>
      tags.map(t =>
        typeof t === 'string'
          ? Tags.findOne({ _id: t }, { sort: { order: 1 }, removed: true })
          : t
      ).filter(identity)

  const isPrivate = Meteor.isServer
    ? async (tags) => some('privateAppointment')(await expand(tags))
    : (tags) => some('privateAppointment')(expand(tags))

  return { getMappingForReports, expand, isPrivate }
}
