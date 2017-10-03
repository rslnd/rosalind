import { mapAssignees } from './mapAssignees'
import { mapTotal } from './mapTotal'
import { mapAverage } from './mapAverage'
import { mapHours } from './mapHours'
import { merge as mergeReport } from './merge'
import { reapplyAddenda, applyAddendum } from './reapplyAddenda'

export const generate = ({ day, appointments, pastAppointments, overrideSchedules, tagMapping, messages, existingReport, addendum }) => {
  let report = {}

  report.day = day
  report.assignees = mapAssignees({ appointments, pastAppointments, overrideSchedules, tagMapping })

  if (addendum && existingReport) {
    report = reapplyAddenda(existingReport)(report)(addendum)
  } else if (addendum) {
    report = applyAddendum(report)(addendum)
  }

  report = mergeReport(report, mapHours({ report, appointments, overrideSchedules }))

  report.total = mapTotal({ report, appointments, messages })
  report.average = mapAverage({ report })

  return report
}
