import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import routes from './routes'

import './index.html'

export default () => {
  render(
    <Provider store={store}>
      {routes()}
    </Provider>, document.getElementById('react-root'))
}
