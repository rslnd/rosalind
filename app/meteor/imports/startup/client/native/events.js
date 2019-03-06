import EventEmitter from 'eventemitter3'
import { attemptRegistration } from './attemptRegistration'
import { handleAndroidEvents } from './android'
import { handleElectronEvents } from './electron'

const events = new EventEmitter()
let bridge = null

// This is set when the native interface is ready
let clientKey = null
let systemInfo = null
let settings = null

export default () => {
  bridge = getBridge()
  if (!bridge) {
    console.log('[Native] No bridge available')
    return
  }

  // Attempt to contact the native platform
  toNative('hello')

  // If we get a welcome event back, we know we're running on a native platform
  onNativeEvent('welcome', async payload => {
    console.log('[Native] Got client key')
    const registration = await attemptRegistration({
      systemInfo: payload.systemInfo,
      clientKey: payload.clientKey
    })

    if (registration.isOk) {
      // Make bindings public only after successful registration
      clientKey = payload.clientKey
      systemInfo = payload.systemInfo
      settings = registration.settings

      events.emit('settings', settings)
    }
  })

  window.toNative = toNative
  window.onNativeEvent = onNativeEvent
  window.isNative = () => !!getClientKey()
}

export const onNativeEvent = (event, callback) => {
  events.on(event, callback)
}

export const toNative = (name, payload = {}) => {
  if (!bridge) {
    throw new Error('Cannot post to native without a bridge')
  }

  console.log('[Native] Posting message', name)
  bridge.postToNative(name, payload)
}

export const getClientKey = () => clientKey

const getBridge = () => (
  handleAndroidEvents({ events }) ||
  // Check electron last because it always succeeds
  handleElectronEvents({ events })
)
