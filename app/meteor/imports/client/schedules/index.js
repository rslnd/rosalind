import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { CalendarSelect } from '../calendars/CalendarSelect'
import { SchedulesDefaultScreen } from './default/SchedulesDefaultScreen'

export const Schedules = ({ match }) => (
  <div>
    <Switch>
      <Route exact path={`${match.url}/default/:slug`} component={SchedulesDefaultScreen} />
      <Route exact path={`${match.url}/default`} component={Select} />
      <Route path={match.url} component={Select} />
    </Switch>
  </div>
)

const Select = () =>
  <div>
    <div className='content-header'>
      <h1>Arbeitszeiten festlegen</h1>
    </div>
    <CalendarSelect basePath='schedules/default' />
  </div>
