import moment from 'moment-timezone'

export const isTracking = ({ Timesheets }) => {
  return async ({ userId }) => {
    return await Timesheets.findOneAsync({
      userId,
      start: { $gt: moment().startOf('day').toDate() },
      tracking: true
    })
  }
}
