import { mapAssignees } from './mapAssignees'
import { mapTotal } from './mapTotal'
import { mapAverage } from './mapAverage'

export const generate = ({ day, appointments, overrideSchedules, tagMapping }) => {
  const report = {}

  report.day = day
  report.assignees = mapAssignees({ appointments, overrideSchedules, tagMapping })
  report.total = mapTotal({ report })
  report.average = mapAverage({ report })

  return report
}
