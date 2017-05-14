import { mapAssignees } from './mapAssignees'
import { mapTotal } from './mapTotal'
import { mapAverage } from './mapAverage'
import { mapHours } from './mapHours'
import { merge as mergeReport } from './merge'

export const generate = ({ day, appointments, overrideSchedules, tagMapping, addendum }) => {
  let report = {}

  report.day = day
  report.assignees = mapAssignees({ appointments, overrideSchedules, tagMapping })

  if (addendum) {
    addendum.map(a => {
      report = mergeReport(report, a)
      console.log('Merging report to produce', report)
    })
  }

  report = mergeReport(report, mapHours({ report, appointments, overrideSchedules }))

  report.total = mapTotal({ report })
  report.average = mapAverage({ report })

  return report
}
