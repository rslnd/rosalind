import React from 'react'
import ReactDOM from 'react-dom'
import { Meteor } from 'meteor/meteor'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import { muiTheme } from './layout/muiTheme'
import { store } from './store'
import { Error } from './components/Error'
import { MainLayoutContainer } from './layout'
import { Dashboard } from './layout/Dashboard'
import { InboundCalls } from './inboundCalls'
import { Appointments } from './appointments'
import { Waitlist } from './appointments/waitlist'
import { Schedules } from './schedules'
import { Reports } from './reports'
import { Users } from './users'
import { Patients } from './patients'
import { System } from './system'
import { Route } from './layout/SafeRoute'

export const Rosalind = () => (
  <ReduxProvider store={store}>
    <Router>
      <MuiThemeProvider theme={muiTheme}>
        <MainLayoutContainer>
          <Switch>
            <Route path='/appointments' component={Appointments} />
            <Route path='/waitlist' component={Waitlist} />
            <Route path='/inboundCalls' component={InboundCalls} />
            <Route path='/schedules' component={Schedules} />
            <Route path='/reports' component={Reports} />
            <Route path='/users' component={Users} />
            <Route path='/patients' component={Patients} />
            <Route path='/system' component={System} />
            <Route exact path='/' component={Dashboard} />
            <Route path='/' component={Error} />
          </Switch>
        </MainLayoutContainer>
      </MuiThemeProvider>
    </Router>
  </ReduxProvider>
)

export default () => {
  const customerName = Meteor.settings.public.CUSTOMER_NAME || 'Rosalind Development'
  document.title = customerName

  document.addEventListener('DOMContentLoaded', () => {
    const containerNode = document.createElement('div')
    containerNode.id = 'rosalind'
    const rootNode = document.body.appendChild(containerNode)
    ReactDOM.render(<Rosalind />, rootNode)
  })
}
