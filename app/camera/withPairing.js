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

    if (props.baseUrl !== url) {
      props.setPairedTo(null)
      Meteor.disconnect()
      Meteor.connect(wsUrl)
      Meteor.ddp.on('connected', async () => {
        await call(props)('clients/register', {
          systemInfo: { ios: true }
        })

        pair(props)({ url, pairingToken })
      })
    } else {
      pair(props)({ url, pairingToken })
    }
  }
}

const pair = props => async ({ url, pairingToken }) => {
  try {
    const consumerId = await call(props)('clients/pairingFinish', {
      pairingToken
    })

    props.setPairedTo(consumerId)
    props.setBaseUrl(url)
    console.log('Paired to consumer', consumerId)
  } catch (e) {
    if (e.error === 404) {
      console.log('No consumer matching the pairing token was found, probably just scanned an expired code')
      return
    }
    console.log('Failed to pair', e)
  }
}

const withCurrentPatient = props => {
  Meteor.subscribe('client-consumer', { clientKey: props.clientKey })
  const consumer = Clients.findOne({ _id: props.pairedTo })

  // We have the id after one roundtrip, while the patient object needs another subscription.
  // We can start taking photos as soon as we have the id.
  let currentPatientId = null
  let currentPatient = null

  if (consumer && consumer.currentPatientId) {
    currentPatientId = consumer.currentPatientId
    Meteor.subscribe('patient-name', { patientId: currentPatientId, clientKey: props.clientKey })

    currentPatient = Patients.findOne({ _id: currentPatientId })
  }

  // Bug: Can't pass as prop for some reason, lags behind by one step
  props.setCurrentPatient(currentPatient)
  props.setCurrentPatientId(currentPatientId)
  return {}
}

export const withPairing = compose(
  withState('pairedTo', 'setPairedTo', null),
  withState('baseUrl', 'setBaseUrl', null),
  withState('currentPatientId', 'setCurrentPatientId', null),
  withState('currentPatient', 'setCurrentPatient', null),
  withHandlers({ handlePairingFinish }),
  withTracker(withCurrentPatient)
)
