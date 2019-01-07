import { compose, withProps, withHandlers } from 'recompose'
import { MainView } from './MainView'
import { withClientKey } from './withClientKey'
import { withPairing } from './withPairing'
import { withMedia } from './withMedia'
import { withOrientation } from './withOrientation'
import { withCameraMode } from './withCameraMode'

export const App = compose(
  withClientKey,
  withPairing,
  withMedia,
  withOrientation,
  withCameraMode
)(MainView)
