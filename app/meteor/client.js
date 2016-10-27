import startup from 'startup/client'
import 'client/css'
import 'client/old'
import 'client/compatibility'
import Alert from 'react-s-alert'

if (module && module.hot && module.hot.accept) {
  module.hot.accept((...args) => {
    console.log('[Client] [HMR] Accepting hot module reload', args)
    Alert.success('Module reloaded')
  })
}

startup()
