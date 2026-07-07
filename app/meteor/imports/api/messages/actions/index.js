import { createReminders } from './createReminders'
import { createReminderForAppointment } from './createReminderForAppointment'
import { sendScheduled } from './sendScheduled'
import { removeReminder } from './removeReminder'

export default function ({ Messages }) {
  return {
    createReminders: createReminders({ Messages }),
    createReminderForAppointment: createReminderForAppointment({ Messages }),
    sendScheduled: sendScheduled({ Messages }),
    removeReminder: removeReminder({ Messages })
  }
}
