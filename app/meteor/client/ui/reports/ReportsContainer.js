import omit from 'lodash/omit'
import moment from 'moment'
import { composeWithTracker } from 'react-komposer'
import { Meteor } from 'meteor/meteor'
import { dateToDay } from 'util/time/day'
import { Reports } from 'api/reports'
import { Loading } from 'client/ui/components/Loading'
import { ReportsScreen } from './ReportsScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('reports').ready()) {
    const date = moment(props.params && props.params.date)
    const day = omit(dateToDay(date), 'date')
    const report = Reports.findOne({ day })
    onData(null, { date, report })
  }
}

export const ReportsContainer = composeWithTracker(composer, Loading)(ReportsScreen)
