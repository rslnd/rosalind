import omit from 'lodash/omit'
import moment from 'moment'
import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { dateToDay } from 'util/time/day'
import { Reports } from 'api/reports'
import { ReportsScreen } from './ReportsScreen'

const composer = (props, onData) => {
  const handle = Meteor.subscribe('reports')
  const date = moment(props.params && props.params.date)

  if (handle.ready()) {
    const report = Reports.findOne({ day: omit(dateToDay(date), 'date') })
    onData(null, { date, report })
  }
}

export const ReportsContainer = composeWithTracker(composer)(ReportsScreen)
