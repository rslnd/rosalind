import { createReminders } from './createReminders'
import { sendScheduled } from './sendScheduled'

export default function ({ Messages }) {
  return {
    createReminders: createReminders({ Messages }),
    sendScheduled: sendScheduled({ Messages })
  }
}
