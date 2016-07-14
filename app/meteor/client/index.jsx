import { render } from 'react-dom'
import { Provider as ReduxProvider } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { muiTheme } from './css/muiTheme'
import { store } from './store'
import routes from './routes'

import './index.html'

export default () => {
  render(
    <ReduxProvider store={store}>
      <MuiThemeProvider muiTheme={muiTheme}>
        {routes()}
      </MuiThemeProvider>
    </ReduxProvider>, document.getElementById('react-root'))
}
