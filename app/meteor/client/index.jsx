import React from 'react'
import { mount } from 'react-mounter'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { setDefaults } from 'meteor/nicocrm:react-komposer-tracker'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { process as server } from 'meteor/clinical:env'
import { muiTheme } from './css/muiTheme'
import { store } from './store'
import { Loading } from 'client/ui/components/Loading'
import { Error } from 'client/ui/components/Error'
import { MainLayoutContainer } from 'client/ui/layout'
import { Dashboard } from 'client/ui/dashboard/Dashboard'
import { InboundCalls } from 'client/ui/inboundCalls'
import { Appointments } from 'client/ui/appointments'
import { Schedules } from 'client/ui/schedules'
import { Reports } from 'client/ui/reports'
import { Users } from 'client/ui/users'
import { System } from 'client/ui/system'
import './index.html'

export const Rosalind = () => (
  <ReduxProvider store={store}>
    <Router>
      <MuiThemeProvider muiTheme={muiTheme}>
        <MainLayoutContainer>
          <Switch>
            <Route path="/appointments" component={Appointments} />
            <Route path="/inboundCalls" component={InboundCalls} />
            <Route path="/schedules" component={Schedules} />
            <Route path="/reports" component={Reports} />
            <Route path="/users" component={Users} />
            <Route path="/system" component={System} />
            <Route exact path="/" component={Dashboard} />
            <Route path="/" component={Error} />
          </Switch>
        </MainLayoutContainer>
      </MuiThemeProvider>
    </Router>
  </ReduxProvider>
)

export default () => {
  setDefaults({
    loadingHandler: Loading,
    errorHandler: Error,
    pure: true
  })

  const customerName = server.env.CUSTOMER_NAME || 'Rosalind Development'
  document.title = customerName

  mount(Rosalind)
}
