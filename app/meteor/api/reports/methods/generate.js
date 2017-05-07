import flow from 'lodash/fp/flow'
import mapKeys from 'lodash/fp/mapKeys'
import mapValues from 'lodash/fp/mapValues'

import groupBy from 'lodash/fp/groupBy'

const mapAssignee = ({ assigneeId, appointments }) => {
  const appointmentsByTags = groupBy('tag')(appointments)

  const byTags = mapValues((appointments) => {
    return {
      planned: appointments.length
    }
  })(appointmentsByTags)

  return {
    assigneeId,
    patients: {
      total: {
        planned: appointments.length
      },
      ...byTags
    }
  }
}

const mapAssignees = ({ appointments }) => {
  const appointmentsByAssignees = groupBy('assigneeId')(appointments)

  return Object.keys(appointmentsByAssignees).map((assigneeId) => {
    return mapAssignee({ appointments: appointmentsByAssignees[assigneeId], assigneeId })
  })
}

export const generate = ({ day, appointments }) => {
  const report = {}

  report.day = day
  report.assignees = mapAssignees({ appointments })
  report.total = {} // TODO

  return report
}
