import React from 'react'
import Alert from 'react-s-alert'
import { TAPi18n } from 'meteor/tap:i18n'
import { onNativeEvent } from './events'
import { Icon } from '../../../client/components/Icon'

const batteryLevelIcon = level => {
  if (level <= 15) { return 'battery-empty' }
  if (level <= 30) { return 'battery-quarter' }
  if (level <= 60) { return 'battery-half' }
  if (level <= 90) { return 'battery-three-quarters' }
  return 'battery-full'
}

export default () => {
  let lastBatteryLevel = -1

  onNativeEvent('peripherals/batteryChange', ({ isCharging, batteryLevel }) => {
    const isSignificantChange = ((lastBatteryLevel - 10) < batteryLevel)
    if (isCharging || (batteryLevel <= 30 && isSignificantChange)) {
      Alert.info(<div>
        <Icon name={batteryLevelIcon(batteryLevel)} />
        &emsp;
        {
          isCharging
          ? `Wird geladen (${batteryLevel}%)`
          : `Batteriestand ${batteryLevel}%`
        }
        <br />
      </div>, { timeout: 2500 })
    }
  })
}
