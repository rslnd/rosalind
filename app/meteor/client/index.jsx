import React from 'react'
import { mount } from 'react-mounter'
import { Provider as ReduxProvider } from 'react-redux'
import { setDefaults } from 'meteor/nicocrm:react-komposer-tracker'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { process as server } from 'meteor/clinical:env'
import { muiTheme } from './css/muiTheme'
import { store } from './store'
import routes from './routes'
import { Loading } from 'client/ui/components/Loading'
import './index.html'

export const Rosalind = () => (
  <ReduxProvider store={store}>
    <MuiThemeProvider muiTheme={muiTheme}>
      {routes()}
    </MuiThemeProvider>
  </ReduxProvider>
)

export default () => {
  setDefaults({
    loadingHandler: () => <Loading />,
    pure: true
  })

  const customerName = server.env.CUSTOMER_NAME || 'Rosalind Development'
  document.title = customerName

  mount(Rosalind)
}
