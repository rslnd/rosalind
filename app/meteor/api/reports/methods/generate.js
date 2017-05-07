import { mapAssignees } from './mapAssignees'
import { mapTotal } from './mapTotal'

export const generate = ({ day, appointments, overrideSchedules, tagMapping }) => {
  const report = {}

  report.day = day
  report.assignees = mapAssignees({ appointments, overrideSchedules, tagMapping })
  report.total = mapTotal({ report })

  return report
}
