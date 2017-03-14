import moment from 'moment'

export const hasRequiredKeys = (message) => {
  if (typeof message !== 'object') { return false }

  return message.to && message.text
}

export const statusOk = (message) => (
  (
    message.status === 'scheduled' ||
    message.status === 'final'
  ) &&
  message.status !== 'sent' &&
  message.status !== 'draft'
)

export const isOutbound = (message) => (
  message.direction === 'outbound'
)

export const hasNoRemainingPlaceholders = (message) => (
  message.text.indexOf('%') === -1
)

export const notExpired = ({ invalidBefore, invalidAfter }, now = moment()) => {
  if (invalidBefore && now.isBefore(invalidBefore)) {
    return false
  }

  if (invalidAfter && now.isAfter(invalidAfter)) {
    return false
  }

  return true
}

export const okToSend = (message) => {
  return (
    hasRequiredKeys(message) &&
    statusOk(message) &&
    isOutbound(message) &&
    hasNoRemainingPlaceholders(message) &&
    notExpired(message)
  )
}
