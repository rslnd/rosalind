import { init } from '@sentry/react-native'

init({
  dsn: 'https://6af65eb19a37410f968d4e602ce572d7@o29235.ingest.sentry.io/62218',
  enableAutoSessionTracking: true
})

import { AppRegistry } from 'react-native'
import { App } from './App'
import { name as appName } from './app.json'
AppRegistry.registerComponent(appName, () => App)
