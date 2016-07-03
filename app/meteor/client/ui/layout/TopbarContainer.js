import { composeWithTracker } from 'react-komposer'
import { Topbar } from './topbar'

const composer = (props, onData) => {
  onData(null, {})
}

const TopbarContainer = composeWithTracker(composer)(Topbar)

export { TopbarContainer }
