import moment from 'moment-timezone'

export const isTracking = ({ Timesheets }) => {
  return ({ userId }) => {
    return Timesheets.findOne({
      userId,
      start: { $gt: moment().startOf('day').toDate() },
      tracking: true
    })
  }
}
