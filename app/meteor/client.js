import startup from 'startup/client'
import 'client/css'
import 'client/old'
import 'client/compatibility'
import { sAlert } from 'meteor/juliancwirko:s-alert'

if (module.hot) {
  module.hot.accept((...args) => {
    console.log('[Client] [HMR] Accepting hot module reload', args)
    sAlert.success('Module reloaded')
  })
}

startup()
