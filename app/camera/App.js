import { compose, withProps, withHandlers } from 'recompose'
import { MainView } from './MainView'
import { withClientKey } from './withClientKey'
import { withPairing } from './withPairing'
import { withMedia } from './withMedia'
import { withOrientation } from './withOrientation'

export const App = compose(
  withClientKey,
  withPairing,
  withMedia,
  withOrientation
)(MainView)
