import moment from 'moment-timezone'

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

const hasMinimumLength = (message) =>
  message.text.length >= 20

export const notExpired = ({ invalidBefore, invalidAfter }, now = moment()) => {
  if (invalidBefore && now.isBefore(invalidBefore)) {
    return false
  }

  if (invalidAfter && now.isAfter(invalidAfter)) {
    return false
  }

  return true
}

const assert = (message, fn, err) => {
  if (!fn(message)) {
    console.error(`[Messages] okToSend message ${message._id} failed check: ${err}`)
    return false
  } else {
    return true
  }
}

export const okToSend = (message) => {
  return (
    message &&
    assert(message, hasRequiredKeys, 'missing required keys') &&
    assert(message, statusOk, `cannot send with status ${message.status}`) &&
    assert(message, isOutbound, 'is not outbound') &&
    assert(message, hasMinimumLength, 'does not have minimum length') &&
    assert(message, hasNoRemainingPlaceholders, 'has remining placeholders') &&
    assert(message, notExpired, 'is expired')
  )
}
