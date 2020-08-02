import { compose, withState, withHandlers } from 'recompose'
import { MainView } from './MainView'
import { withClientKey } from './withClientKey'
import { withPairing } from './withPairing'
import { withMedia } from './withMedia'
import { withOrientation } from './withOrientation'
import { withModeDocument } from './withModeDocument'

export const App = compose(
  withState('alert', 'setAlert', null),
  withHandlers({
    showSuccess: props => message => {
      props.setAlert({
        level: 'success',
        message
      })
      setTimeout(() => props.setAlert(null), 5000)
    },
    showError: props => message => {
      props.setAlert({
        level: 'warning',
        message
      })
      setTimeout(() => props.setAlert(null), 5000)
    }
  }),
  withClientKey,
  withPairing,
  withMedia,
  withOrientation,
  withModeDocument
)(MainView)
