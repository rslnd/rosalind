import find from 'lodash/find'
import { normalizePhoneNumber } from './normalizePhoneNumber'

export const compareMessages = (childMessage) => {
  const childFrom = normalizePhoneNumber(childMessage.from)
  return (parentMessage) => normalizePhoneNumber(parentMessage.to) === childFrom
}

export const findParentMessage = ({ messages, message }) => {
  return find(messages, compareMessages(message)) || null
}
