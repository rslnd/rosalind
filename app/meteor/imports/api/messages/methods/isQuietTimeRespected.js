import { Settings } from '../../settings'
import { isQuietTime } from './isQuietTime'

export const canIgnoreQuietTime = (message) => {
  return (message.type === 'intentToCancelConfirmation')
}

export const isQuietTimeRespected = async (message) => {
  return (
    !isQuietTime() ||
    (isQuietTime() && canIgnoreQuietTime(message)) ||
    await Settings.get('messages.sms.overrideQuietTime')
  )
}
