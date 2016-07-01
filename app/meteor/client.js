import startup from 'startup/client'
import 'client/old'
import 'client/compatibility'

if (module.hot) {
  module.hot.accept((...args) => {
    console.log('[HMR Entry]', args)
  })
}

startup()
