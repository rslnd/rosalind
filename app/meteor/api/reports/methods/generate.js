import { mapAssignees } from './mapAssignees'
import { mapTotal } from './mapTotal'

export const generate = ({ day, appointments, overrideSchedules }) => {
  const report = {}

  report.day = day
  report.assignees = mapAssignees({ appointments, overrideSchedules })
  report.total = mapTotal({ report })

  return report
}
