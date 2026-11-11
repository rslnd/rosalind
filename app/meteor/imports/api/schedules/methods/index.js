import { Users } from '../../users'
import getScheduledHours from './getScheduledHours'
import isOpen from './isOpen'
import isScheduled from './isScheduled'
import getScheduledAssignees from './getScheduledAssignees'

export default function ({ Schedules }) {
  return {
    getScheduledHours: getScheduledHours({ Schedules }),
    getScheduledAssignees: getScheduledAssignees({ Schedules }),
    isOpen: isOpen({ Schedules }),
    isScheduled: isScheduled({ Schedules, Users })
  }
}
