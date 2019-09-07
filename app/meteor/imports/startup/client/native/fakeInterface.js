export const handleFakeEvents = ({ events }) => {
  const fakeClientKey = getUrlParams('clientKey')
  if (fakeClientKey) {
    console.log('[Native] fakeInterface: Faking native API')

    // Expose to console
    window.postToWeb = (name, payload) => {
      console.log('[Native] fakeInterface: postToWeb: Emitting', name, payload)
      events.emit(name, payload)
    }

    setTimeout(() => {
      window.postToWeb('welcome', {
        systemInfo: {
          name: 'Fake Interface'
        },
        clientKey: fakeClientKey
      })
    }, 300)

    return {
      postToNative: (name, payload) =>
        console.log('[Native] fakeInterface: postToNative', name, payload)
    }
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
