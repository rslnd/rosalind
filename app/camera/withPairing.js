import Meteor from 'react-native-meteor'
import { call } from './util'
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
    const wsOrigin = url.replace(/^http/, 'ws')
    const wsUrl = [wsOrigin, 'websocket'].join('/')

    console.log('Pairing to', url, 'with code', pairingToken, 'over websocket', wsUrl)

    Meteor.disconnect()
    Meteor.connect(wsUrl)

    Meteor.ddp.on('connected', async () => {
      try {
        await call(props)('clients/register', {
          systemInfo: { ios: true }
        })

        const consumerId = await call(props)('clients/pairingFinish', {
          pairingToken
        })

        console.log('Paired to consumer', consumerId)
      } catch (e) {
        console.error('Failed', e)
      }
    })
  }
}

export const withPairing = compose(
  withHandlers({ handlePairingFinish })
)
