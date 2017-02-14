import { createReminders } from './createReminders'
import { sendScheduled } from './sendScheduled'
import { removeReminder } from './removeReminder'

export default function ({ Messages }) {
  return {
    createReminders: createReminders({ Messages }),
    sendScheduled: sendScheduled({ Messages }),
    removeReminder: removeReminder({ Messages })
  }
}
