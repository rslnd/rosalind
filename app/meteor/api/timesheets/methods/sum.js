import moment from 'moment'
import add from 'lodash/sum'

export const sum = ({ Timesheets }) => {
  return ({ userId, start }) => {
    const timesheets = Timesheets.find({
      userId,
      start: { $gt: moment(start).startOf('day').toDate() }
    })

    return add(timesheets.map((t) => t.duration()))
  }
}
