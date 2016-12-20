import { createReminders } from './createReminders'
import { sendReminders } from './sendReminders'

export default function ({ Messages }) {
  return {
    createReminders: createReminders({ Messages }),
    sendReminders: sendReminders({ Messages })
  }
}
