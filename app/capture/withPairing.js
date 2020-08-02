import Meteor, { Mongo, withTracker } from '@albertzak/react-native-meteor'
import { call } from './util'
import { withHandlers, compose, withState } from 'recompose'

const Patients = new Mongo.Collection('patients', { cursoredFind: true })
const Clients = new Mongo.Collection('clients', { cursoredFind: true })

const minTokenLength = 90

const pairingCodeRegex = global.__DEV__
  ? /^rslndPair\*(https?:\/\/.*#.*)/
  : /^rslndPair\*(https:\/\/.*#.*)/

const parsePairingCode = pairingCode => {
  if (pairingCode.length >= minTokenLength + 20) {
    const match = pairingCode.match(pairingCodeRegex)
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
    props.setPairedTo(null)
    Meteor.connect(wsUrl)

    props.showSuccess('connected')

    Meteor.ddp.on('connected', async () => {
      await call(props)('clients/register', {
        systemInfo: { ios: true }
      })

      pair(props)({ url, pairingToken })
    })
  }
}

const pair = props => async ({ url, pairingToken }) => {
  try {
    const consumerId = await call(props)('clients/pairingFinish', {
      pairingToken
    })

    props.setPairedTo(consumerId)
    props.setBaseUrl(url)
    props.showSuccess('connected')
    console.log('Paired to consumer', consumerId)
  } catch (e) {
    if (e.error === 404) {
      console.log('No consumer matching the pairing token was found, probably just scanned an expired code')
      return
    }
    console.log('Failed to pair', e)
    props.showError('tryAgain')
  }
}

const withCurrentPatient = props => {
  if (!props.pairedTo) {
    return props
  }

  Meteor.subscribe('client-consumer', { clientKey: props.clientKey })
  const consumer = Clients.findOne({ _id: props.pairedTo })

  // We have the next media attributes after one roundtrip, while the patient object needs another subscription.
  // We can start taking photos as soon as we have the attributes as they simply get attached to created media.
  let nextMedia = null
  let currentPatient = null

  if (consumer && consumer.nextMedia && consumer.nextMedia.patientId) {
    nextMedia = consumer.nextMedia
    Meteor.subscribe('patient-name', { patientId: nextMedia.patientId, clientKey: props.clientKey })

    currentPatient = Patients.findOne({ _id: nextMedia.patientId })
  }

  // Bug: Can't pass as prop for some reason, lags behind by one step
  props.setCurrentPatient(currentPatient)
  props.setNextMedia(nextMedia)
  return {} // Lags behind one step when passing props here
}

export const withPairing = compose(
  withState('pairedTo', 'setPairedTo', null),
  withState('baseUrl', 'setBaseUrl', null),
  withState('nextMedia', 'setNextMedia', null),
  withState('currentPatient', 'setCurrentPatient', null),
  withHandlers({ handlePairingFinish }),
  withTracker(withCurrentPatient)
)
