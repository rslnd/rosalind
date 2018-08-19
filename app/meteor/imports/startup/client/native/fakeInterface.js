import EventEmitter from 'eventemitter3'

export default () => {
  const fakeClientKey = getUrlParams('clientKey')
  if (fakeClientKey) {
    console.log('[Native] Faking native API')
    const events = new EventEmitter()
    window.native = {
      clientKey: fakeClientKey,
      events,
      emit: (event, payload) => events.emit(event, payload),
      systemInfo: {
        client: 'fake'
      },
      load: () => {}
    }

    setTimeout(() => window.native.emit('clientKey', 300))
  }
}

const getUrlParams = (prop) => {
  let params = {}
  const search = decodeURIComponent(
    window.location.href.slice(
      window.location.href.indexOf('?') + 1
    )
  )
  const definitions = search.split('&')

  definitions.forEach(pair => {
    const parts = pair.split('=', 2)
    params[parts[0]] = parts[1]
  })

  return prop
    ? params[prop]
    : params
}
