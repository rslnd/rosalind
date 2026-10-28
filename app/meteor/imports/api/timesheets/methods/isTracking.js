import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'

const selector = userId => ({
  userId,
  start: { $gt: moment().startOf('day').toDate() },
  tracking: true
})

// Client: synchronous (reactive minimongo) so it can be used in trackers/render.
// Server: async; server callers must await.
export const isTracking = ({ Timesheets }) => Meteor.isServer
  ? async ({ userId }) => Timesheets.findOneAsync(selector(userId))
  : ({ userId }) => Timesheets.findOne(selector(userId))
