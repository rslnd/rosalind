import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Blaze from 'meteor/gadicc:blaze-react-component'
import { StatusBoardContainer } from 'client/ui/schedules/statusBoard/StatusBoardContainer'
import { TimesheetsContainer } from 'client/ui/timesheets/TimesheetsContainer'
import { RequestsContainer } from 'client/ui/schedules/requests/RequestsContainer'
import { HolidaysContainer } from 'client/ui/schedules/holidays/HolidaysContainer'

export const SchedulesRoutes = () => (
  <Route path="schedules">
    <IndexRoute component={StatusBoardContainer} />
    <Route path="default" component={() => <Blaze template="schedulesDefault" />} />
    <Route path="override" component={() => <Blaze template="schedulesOverride" />} />
    <Route path="requests" component={RequestsContainer} />
    <Route path="timesheets">
      <IndexRoute component={TimesheetsContainer} />
      <Route path=":dateRange" component={TimesheetsContainer} />
    </Route>
    <Route path="businessHours" component={() => <Blaze template="businessHours" />} />
    <Route path="holidays" component={HolidaysContainer} />
    <Route path="default/:username" component={() => <Blaze template="schedulesDefault" />} />
  </Route>
)
