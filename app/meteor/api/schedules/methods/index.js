import Time from 'util/time'
import { Users } from 'api/users'
import { Groups } from 'api/groups'
import getScheduledHours from './getScheduledHours'
import isOpen from './isOpen'
import isScheduled from './isScheduled'
import misc from './misc'

export default function ({ Schedules }) {
  return {
    getScheduledHours: getScheduledHours({ Schedules }),
    isOpen: isOpen({ Schedules }),
    isScheduled: isScheduled({ Schedules, Users }),
    misc: misc({ Schedules, Users, Groups, Time })
  }
}
