import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'
import groupBy from 'lodash/fp/groupBy'

const mapAssignee = ({ assigneeId, appointments }) => {
  return {
    assigneeId,
    patients: {
      total: {
        planned: appointments.length
      }
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
