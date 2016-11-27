import omit from 'lodash/omit'
import moment from 'moment'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { dateToDay } from 'util/time/day'
import { Reports } from 'api/reports'
import { Loading } from 'client/ui/components/Loading'
import { ReportsScreen } from './ReportsScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('reports').ready()) {
    const date = moment(props.params && props.params.date)
    const day = omit(dateToDay(date), 'date')
    const report = Reports.findOne({ day })
    const canShowRevenue = Roles.userIsInRole(Meteor.userId(), [ 'reports-showRevenue', 'admin' ])
    onData(null, { date, report, canShowRevenue })
  }
}

export const ReportsContainer = composeWithTracker(composer, Loading)(ReportsScreen)
