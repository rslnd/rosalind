import moment from 'moment-timezone'
import add from 'lodash/sum'

export const sum = ({ Timesheets }) => {
  return ({ userId, start, end }) => {
    let selector = {
      userId,
      start: { $gt: moment(start).startOf('day').toDate() }
    }

    if (end) {
      selector.end = { $lt: moment(end).endOf('day').toDate() }
    }

    const timesheets = Timesheets.find(selector)

    return add(timesheets.map((t) => t.duration()))
  }
}
