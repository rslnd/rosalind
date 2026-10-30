import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'

const format = ({ firstTimesheet, lastTimesheet, isTracking }) => {
  if (!firstTimesheet) { return null }

  const start = firstTimesheet.start
  const end = !isTracking && lastTimesheet.end

  return `${moment(start).format('H:mm')}-${end ? moment(end).format('H:mm') : __('timesheets.now')}`
}

const selector = userId => ({
  userId,
  start: { $gt: moment().startOf('day').toDate() }
})

// Client: synchronous (reactive minimongo) so it can be used in trackers/render.
// Server: async; server callers must await.
export const stringify = ({ Timesheets }) => Meteor.isServer
  ? async ({ userId }) => {
    const firstTimesheet = (await Timesheets.find(selector(userId), {
      sort: { start: 1 },
      limit: 1
    }).fetchAsync())[0]

    const lastTimesheet = (await Timesheets.find(selector(userId), {
      sort: { start: -1 },
      limit: 1
    }).fetchAsync())[0]

    const isTracking = await Timesheets.methods.isTracking({ userId })

    return format({ firstTimesheet, lastTimesheet, isTracking })
  }
  : ({ userId }) => {
    const firstTimesheet = Timesheets.find(selector(userId), {
      sort: { start: 1 },
      limit: 1
    }).fetch()[0]

    const lastTimesheet = Timesheets.find(selector(userId), {
      sort: { start: -1 },
      limit: 1
    }).fetch()[0]

    const isTracking = Timesheets.methods.isTracking({ userId })

    return format({ firstTimesheet, lastTimesheet, isTracking })
  }
