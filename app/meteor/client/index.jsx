import { mount } from 'react-mounter'
import { Provider as ReduxProvider } from 'react-redux'
import { setDefaultLoadingComponent } from 'react-komposer'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { muiTheme } from './css/muiTheme'
import { store } from './store'
import routes from './routes'
import { Loading } from 'client/ui/components/Loading'
import './index.html'

export default () => {
  setDefaultLoadingComponent(Loading)

  mount(() => (
    <ReduxProvider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        {routes()}
      </MuiThemeProvider>
    </ReduxProvider>
  ))
}
