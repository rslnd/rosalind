import { mapAssignees } from './mapAssignees'
import { mapTotal } from './mapTotal'
import { mapAverage } from './mapAverage'
import { mapHours } from './mapHours'
import { merge as mergeReport } from './merge'
import { reapplyAddenda, applyAddendum } from './reapplyAddenda'

export const generate = ({ calendar, day, appointments, pastAppointments, daySchedule, overrideSchedules, tagMapping, messages, existingReport, addendum }) => {
  let report = {}

  report.calendarId = calendar._id
  report.day = day
  report.assignees = mapAssignees({ day, daySchedule, calendar, appointments, pastAppointments, overrideSchedules, tagMapping })

  if (addendum && existingReport) {
    report = reapplyAddenda(existingReport)(report)(addendum)
  } else if (addendum) {
    report = applyAddendum(report)(addendum)
  }

  report = mergeReport(report, mapHours({ calendar, report, appointments, overrideSchedules }))

  report.total = mapTotal({ report })
  report.average = mapAverage({ report })

  report.createdAt = new Date()

  return report
}
