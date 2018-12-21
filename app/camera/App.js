import { compose, withProps, withHandlers } from 'recompose'
import { MainView } from './MainView'
import { withClientKey } from './withClientKey'

const handlePair = code => {
  // Meteor.connect('ws://10.0.0.21:3000/websocket')
  console.log('Pairing to', code)
}

const log = withProps(p => console.log('Props', p))

export const App = compose(
  withClientKey
)(MainView)
