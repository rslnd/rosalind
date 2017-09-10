import { mapAssignees } from './mapAssignees'
import { mapTotal } from './mapTotal'
import { mapAverage } from './mapAverage'
import { mapHours } from './mapHours'
import { mapNoShows } from './mapNoShows'
import { merge as mergeReport } from './merge'
import { reapplyAddenda, applyAddendum } from './reapplyAddenda'

export const generate = ({ day, appointments, overrideSchedules, tagMapping, messages, existingReport, addendum }) => {
  let report = {}

  report.day = day
  report.assignees = mapAssignees({ appointments, overrideSchedules, tagMapping })

  report = mergeReport(report, mapHours({ report, appointments, overrideSchedules }))

  if (addendum && existingReport) {
    report = reapplyAddenda(existingReport)(report)(addendum)
  } else if (addendum) {
    report = applyAddendum(report)(addendum)
  }

  report.total = mapTotal({ report, appointments, messages })
  report.average = mapAverage({ report })

  return report
}
