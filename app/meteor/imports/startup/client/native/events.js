const handlerQueue = []

export default () => {
  if (!window.native) { return }

  const nativeEventPolling = setInterval(() => {
    if (window.native.events) {
      clearInterval(nativeEventPolling)
      console.log(`[Native] Event emitter became available, registering ${handlerQueue.length} delayed handlers`)
      handlerQueue.forEach(({ event, callback }) => {
        window.native.events.on(event, callback)
        console.log(`[Native] Registered delayed callback for event ${event}`)
      })
    }
  }, 200)
}

// Queue event registration until native event emitter is available
export const onNativeEvent = (event, callback) => {
  if (!window.native) { return }

  if (window.native.events) {
    window.native.events.on(event, callback)
    console.log(`[Native] Registered callback for event ${event}`)
  } else {
    console.log(`[Native] Delaying registering callback for event ${event}`)
    handlerQueue.push({ event, callback })
  }
}
