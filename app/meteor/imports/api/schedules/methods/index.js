import { Users } from '../../users'
import { Groups } from '../../groups'
import getScheduledHours from './getScheduledHours'
import isOpen from './isOpen'
import isScheduled from './isScheduled'


export default function ({ Schedules }) {
  return {
    getScheduledHours: getScheduledHours({ Schedules }),
    isOpen: isOpen({ Schedules }),
    isScheduled: isScheduled({ Schedules, Users })
  }
}
