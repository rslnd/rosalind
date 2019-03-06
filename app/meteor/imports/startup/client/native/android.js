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
  if (window.rslndAndroid) {
    // Native->Web: Expose global function to post events via injected code
    window.rslndAndroidPostToWeb = postToWeb(events)

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

  if (window.rslndAndroid[name]) {
    console.log(`[Native] Android: Calling bridge function ${name}`)
    try {
      return window.rslndAndroid[name](payload)
    } catch (e) {
      // fallthrough
    }
  }

  throw new Error(`Function ${name} is not exposed on the bridge interface rslndAndroid`)
}

const postToWeb = events => (name, payload) => {
  if (!toWeb.indexOf(name)) {
    throw new Error(`Event name not whitelisted: ${name}`)
  }
  console.log(`[Native] Android: Emitting event ${name}`)
  events.emit(name, payload)
}
