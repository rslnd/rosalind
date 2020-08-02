import { compose, withState, withHandlers } from 'recompose'
import { MainView } from './MainView'
import { withClientKey } from './withClientKey'
import { withPairing } from './withPairing'
import { withMedia } from './withMedia'
import { withOrientation } from './withOrientation'
import { withModeDocument } from './withModeDocument'

const showAlert = level => props => message => {
  props.setAlert({
    level,
    message
  })
  setTimeout(() => props.setAlert(null), 6500)
}

export const App = compose(
  withState('alert', 'setAlert', null),
  withHandlers({
    showSuccess: showAlert('success'),
    showError: showAlert('error'),
    showWarning: showAlert('warning')
  }),
  withClientKey,
  withPairing,
  withMedia,
  withOrientation,
  withModeDocument
)(MainView)
