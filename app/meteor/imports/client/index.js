import React from 'react'
import ReactDOM from 'react-dom'
import { HotKeys, configure } from 'react-hotkeys'
import { NonceProvider } from 'react-select'
import { Meteor } from 'meteor/meteor'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter as Router, Switch } from 'react-router-dom'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles'
import { muiTheme } from './layout/muiTheme'
import { store } from './store'
import { Error } from './components/Error'
import { MainLayoutContainer } from './layout'
import { Dashboard } from './layout/Dashboard'
import { InboundCalls } from './inboundCalls'
import { Appointments } from './appointments'
import { Checkups } from './checkups'
import { Waitlist } from './appointments/waitlist'
import { Schedules } from './schedules'
import { Reports } from './reports'
import { Users } from './users'
import { Patients } from './patients'
import { System } from './system'
import { Route } from './layout/SafeRoute'
import { getStyleNonce } from './layout/styles'

export const Rosalind = () => (
  <ReduxProvider store={store}>
    <Router>
      <NonceProvider nonce={getStyleNonce()}>
        <MuiThemeProvider theme={muiTheme}>
          <HotKeys keyMap={keyMap}>
            <MainLayoutContainer>
              <Switch>
                <Route path='/appointments' component={Appointments} />
                <Route path='/waitlist' component={Waitlist} />
                <Route path='/checkups' component={Checkups} />
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
          </HotKeys>
        </MuiThemeProvider>
      </NonceProvider>
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

const keyMap = {
  CLOSE: 'Escape',
  NEXT: 'ArrowRight',
  PREV: 'ArrowLeft',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown'
}

// Debug hotkeys
configure({
  logLevel: (window.location.hash || '').indexOf('debug') !== -1 ? 'debug' : 'warn'
})
