import { Users } from '../../users'
import getScheduledHours from './getScheduledHours'
import isOpen from './isOpen'
import isScheduled from './isScheduled'
import getScheduledAssignees from './getScheduledAssignees'
import getColumns from './getColumns'
import { columnsToAvailabilities } from './columnsToAvailabilities'

export default function ({ Schedules }) {
  return {
    getScheduledHours: getScheduledHours({ Schedules }),
    getScheduledAssignees: getScheduledAssignees({ Schedules }),
    getColumns: getColumns({ Schedules }),
    columnsToAvailabilities,
    isOpen: isOpen({ Schedules }),
    isScheduled: isScheduled({ Schedules, Users })
  }
}
