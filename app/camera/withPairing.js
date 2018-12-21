import Meteor, { withTracker } from 'react-native-meteor'
import { withHandlers, compose } from 'recompose'

const parsePairingCode = pairingCode => {
  if (pairingCode.length >= 220) {
    const match = pairingCode.match(/^rslndPair\*(https?:\/\/.*#.*)/)
    if (match && match[0]) {
      const [_, url, pairingToken] = match[0].split(/\*|#/)
      return { url, pairingToken }
    }
  }

  return { error: 'invalid pairing code' }
}

const handlePairingFinish = props => pairingCode => {
  console.log('called handle pairing finish', pairingCode)
  const { url, pairingToken } = parsePairingCode(pairingCode)
  if (url && pairingToken) {
    console.log('Pairing to', url, 'with code', pairingToken)
  }

  // Meteor.connect('ws://10.0.0.21:3000/websocket')
}

export const withPairing = compose(
  withHandlers({ handlePairingFinish })
)
