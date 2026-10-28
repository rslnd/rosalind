import { Meteor } from 'meteor/meteor'
import moment from 'moment-timezone'
import add from 'lodash/sum'

const buildSelector = ({ userId, start, end }) => {
  let selector = {
    userId,
    start: { $gt: moment(start).startOf('day').toDate() }
  }

  if (end) {
    selector.end = { $lt: moment(end).endOf('day').toDate() }
  }

  return selector
}

// Client: synchronous (reactive minimongo). Server: async; server callers must await.
export const sum = ({ Timesheets }) => Meteor.isServer
  ? async (args) => add((await Timesheets.find(buildSelector(args)).fetchAsync()).map(duration))
  : (args) => add(Timesheets.find(buildSelector(args)).map(duration))

export const duration = t => moment(t.end).diff(moment(t.start))
