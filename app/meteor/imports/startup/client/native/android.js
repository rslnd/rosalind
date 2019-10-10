const toWeb = [
  'welcome',
  'peripherals/screenOff',
  'peripherals/screenOn',
  'peripherals/batteryChange',
  'peripherals/wifiConnected',
  'peripherals/wifiDisconnected'
]

const toNative = [
  'hello'
]

export const handleAndroidEvents = ({ events }) => {
  if (isLegacyAndroid()) {
    console.log('[Native] legacyAndroid handling events')

    const attemptInstallHandler = () => {
      if (window.native && window.native.events && window.native.events.on) {
        console.log('[Native] legacyAndroid Registered event handler')

        setTimeout(() => {
          console.log('[Native] legacyAndroid Posting welcome')
          events.emit('welcome', {
            clientKey: window.native.clientKey,
            systemInfo: {
              bridge: 'androidLegacy',
              ...window.native.systemInfo
            }
          })
        }, 100)
      } else {
        window.requestAnimationFrame(attemptInstallHandler)
      }
    }
    window.requestAnimationFrame(attemptInstallHandler)

    window.native.load()

    return {
      postToNative: postToNativeLegacy(events)
    }
  }

  if (window.rslndAndroid) {
    // Native->Web: Expose global function to post events via injected code
    window.rslndAndroidPostToWeb = postToWeb(events)

    console.log('[Native] Handling Android events')

    return {
      postToNative: postToNative(events)
    }
  }
}

// Native<-Web: When a supported event is emitted, forward it via function call on the bridge interface
const postToNative = events => (name, payload) => {
  if (toNative.indexOf(name) === -1) {
    console.error(`[Native] Android: Refusing to post non-whitelisted event to native: ${name}`)
    return
  }

  const a = Object.keys(window.rslndAndroid)
  console.log(`[Native] Android: Available native methods: ${JSON.stringify(a)}`)

  try {
    // Avoids "Method not found" when calling parameters don't match what's defined in Java
    if (payload && Object.keys(payload).length >= 1) {
      console.log(`[Native] Android: Calling bridge function ${name} with stringified arguments ${Object.keys(payload)}`)
      return window.rslndAndroid[name](JSON.stringify(payload))
    } else {
      console.log(`[Native] Android: Calling bridge function ${name} without arguments`)
      return window.rslndAndroid[name]()
    }
  } catch (e) {
    console.log(`[Native] Android: Error while calling bridge function "${name}" ${e.message} ${e.stack}`)
    // fallthrough
  }

  console.log(`[Native] Android: Error: Function "${name}" is not exposed on the bridge interface rslndAndroid, or calling parameters don't match the method signature in Java. Called with ${Object.keys(payload)}`)
}

const postToWeb = events => (name, payload) => {
  if (toWeb.indexOf(name) === -1) {
    throw new Error(`Event name not whitelisted: ${name} in ${toWeb}`)
  }
  console.log(`[Native] Android: Emitting event ${name}`)
  events.emit(name, payload)
}

// Legacy handlers

const postToNativeLegacy = events => (name, payload) => {
  console.log(`[Native] legacyAndroid: Posting to native ${name}`)
  if (window.native.events) {
    window.native.events.emit(name, payload)
  } else {
    console.log('[Native] legacyAndroid: EventEmitter not loaded yet, discarding event')
  }
}

const isLegacyAndroid = () =>
  window.native && window.native.android && window.native.load
