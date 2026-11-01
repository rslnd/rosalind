import React from 'react'
import { createRoot } from 'react-dom/client'
import { HotKeys, configure } from 'react-hotkeys'
import { NonceProvider } from 'react-select'
import { Meteor } from 'meteor/meteor'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter as Router, Routes } from 'react-router-dom'
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
import { route } from './layout/SafeRoute'
import { getStyleNonce } from './layout/styles'

export const Rosalind = () => (
  <ReduxProvider store={store}>
    <Router>
      <NonceProvider nonce={getStyleNonce()} cacheKey='react-select'>
        <MuiThemeProvider theme={muiTheme}>
          <HotKeys keyMap={keyMap}>
            <MainLayoutContainer>
              <Routes>
                {route('/appointments/*', Appointments)}
                {route('/waitlist/*', Waitlist)}
                {route('/checkups/*', Checkups)}
                {route('/inboundCalls/*', InboundCalls)}
                {route('/schedules/*', Schedules)}
                {route('/reports/*', Reports)}
                {route('/users/*', Users)}
                {route('/patients/*', Patients)}
                {route('/system/*', System)}
                {route('/', Dashboard)}
                {route('*', Error)}
              </Routes>
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

    const root = createRoot(rootNode)
    const rerender = () => {
      root.render(<Rosalind />)
    }

    rerender()

    window.rerender = rerender
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
