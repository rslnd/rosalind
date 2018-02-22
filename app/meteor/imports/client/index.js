import React from 'react'
import { mount } from 'react-mounter'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { setDefaults } from 'meteor/nicocrm:react-komposer-tracker'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { process as server } from 'meteor/clinical:env'
import './css'
import { muiTheme } from './css/muiTheme'
import { store } from './store'
import { Loading } from './components/Loading'
import { Error } from './components/Error'
import { MainLayoutContainer } from './layout'
import { Dashboard } from './dashboard/Dashboard'
import { InboundCalls } from './inboundCalls'
import { Appointments } from './appointments'
import { WaitlistContainer } from './appointments/waitlist/WaitlistContainer'
import { Schedules } from './schedules'
import { Reports } from './reports'
import { Users } from './users'
import { Patients } from './patients'
import { System } from './system'

export const Rosalind = () => (
  <ReduxProvider store={store}>
    <Router>
      <MuiThemeProvider theme={muiTheme}>
        <MainLayoutContainer>
          <Switch>
            <Route path='/appointments' component={Appointments} />
            <Route path='/waitlist' component={WaitlistContainer} />
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
  setDefaults({
    loadingHandler: Loading,
    errorHandler: Error,
    pure: true
  })

  const customerName = server.env.CUSTOMER_NAME || 'Rosalind Development'
  document.title = customerName

  mount(Rosalind)
}
