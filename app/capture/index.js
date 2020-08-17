import { NativeModules } from 'react-native'
const { DocumentScanner } = NativeModules

const interceptLogs = (level, originalFn) => (...objs) => {
  originalFn(...objs)
  const message = level + ' ' + objs.map(o => {
    try {
      return JSON.stringify(o)
    } catch (e) {
      try {
        return o.toString()
      } catch (e) {
        return '[circular?]'
      }
    }
  }).join(' ')

  DocumentScanner.log(message)
  return undefined
}

console.log = interceptLogs('log', console.log)
console.error = interceptLogs('error', console.error)
console.debug = interceptLogs('debug', console.debug)
console.info = interceptLogs('info', console.info)

import { init } from '@sentry/react-native'

init({
  dsn: 'https://6af65eb19a37410f968d4e602ce572d7@o29235.ingest.sentry.io/62218',
  enableAutoSessionTracking: true
})

import { AppRegistry } from 'react-native'
import { App } from './App'
import { name as appName } from './app.json'
AppRegistry.registerComponent(appName, () => App)
