import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { onNativeEvent } from './events'
import { lock as screenLock } from '../../../client/layout/Lock'

const batteryLevelIcon = level => {
  if (level <= 15) { return 'battery-empty' }
  if (level <= 30) { return 'battery-quarter' }
  if (level <= 60) { return 'battery-half' }
  if (level <= 90) { return 'battery-three-quarters' }
  return 'battery-full'
}

const battery = () => {
  let lastBatteryLevel = -1

  onNativeEvent('peripherals/batteryChange', ({ isCharging, batteryLevel }) => {
    const isSignificantChange = ((lastBatteryLevel - 10) < batteryLevel)
    if (isCharging || (batteryLevel <= 30 && isSignificantChange)) {
      const text = isCharging
        ? `Wird geladen (${batteryLevel}%)`
        : `Batteriestand ${batteryLevel}%`
      Alert.info(text, {
        timeout: 2500,
        customFields: { icon: batteryLevelIcon(batteryLevel) }
      })
    }

    lastBatteryLevel = batteryLevel
  })
}

const wifi = () => {
  let wifiConnected = true
  let alertId = null

  onNativeEvent('peripherals/wifiConnected', () => {
    if (!wifiConnected) {
      wifiConnected = true
      if (alertId) {
        Alert.close(alertId)
        alertId = null
      }
      Alert.success('Verbunden', { customFields: { icon: 'wifi' } })
    }
  })

  onNativeEvent('peripherals/wifiDisconnected', () => {
    if (wifiConnected) {
      wifiConnected = false
      alertId = Alert.error('Keine Verbindung', {
        timeout: 'none',
        customFields: { icon: 'times' }
      })
    }
  })
}

const lock = () => {
  onNativeEvent('peripherals/screenOn', () => {
  })

  onNativeEvent('peripherals/screenOff', () => {
    screenLock()
  })
}

export default () => {
  battery()
  wifi()
  lock()
}
