import omit from 'lodash/omit'
import moment from 'moment-timezone'
import { composeWithTracker } from 'meteor/nicocrm:react-komposer-tracker'
import { withRouter } from 'react-router-dom'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/alanning:roles'
import { dateToDay } from 'util/time/day'
import { Reports } from 'api/reports'
import { Loading } from 'client/ui/components/Loading'
import { ReportsScreen } from './ReportsScreen'

const composer = (props, onData) => {
  if (Meteor.subscribe('reports').ready()) {
    const dateParam = props.match && props.match.params && props.match.params.date
    const date = moment(dateParam)
    const day = omit(dateToDay(date), 'date')
    const report = Reports.findOne({ day })
    const canShowRevenue = Roles.userIsInRole(Meteor.userId(), [ 'reports-showRevenue', 'admin' ])

    const generateReport = () => {
      return Reports.actions.generate.callPromise({ day })
    }

    const viewAppointments = () => {
      props.history.push(`/appointments/${dateParam}`)
    }

    onData(null, { date, report, generateReport, viewAppointments, canShowRevenue })
  }
}

export const ReportsContainer = withRouter(composeWithTracker(composer, Loading)(ReportsScreen))
