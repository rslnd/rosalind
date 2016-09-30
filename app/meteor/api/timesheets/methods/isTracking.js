import moment from 'moment'

export const isTracking = ({ Timesheets }) => {
  return ({ userId }) => {
    return Timesheets.findOne({
      userId,
      start: { $gt: moment().startOf('day').toDate() },
      tracking: true
    })
  }
}
