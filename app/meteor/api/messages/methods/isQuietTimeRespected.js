import { isQuietTime } from './isQuietTime'

export const canIgnoreQuietTime = (message) => {
  return (message.type === 'intentToCancelConfirmation')
}

export const isQuietTimeRespected = (message) => {
  return (!isQuietTime() || (isQuietTime() && canIgnoreQuietTime(message)))
}
