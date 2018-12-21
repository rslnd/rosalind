import { compose, withProps, withHandlers } from 'recompose'
import { MainView } from './MainView'
import { withClientKey } from './withClientKey'
import { withPairing } from './withPairing'

export const App = compose(
  withClientKey,
  withPairing
)(MainView)
