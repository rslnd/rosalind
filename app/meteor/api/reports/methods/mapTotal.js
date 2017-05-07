import flatten from 'lodash/flatten'
import uniq from 'lodash/uniq'
import add from 'lodash/add'
import fromPairs from 'lodash/fromPairs'

const mapPatients = ({ report }) => {
  const tags = uniq(flatten(report.assignees.map((assignee) => {
    return Object.keys(assignee.patients)
  })))

  const byTag = tags.map((tag) => {
    const sum = report.assignees.map((assignee) => {
      // Don't count any hours for unassigned appointments
      if (assignee.assigneeId === 'null') { return 0 }

      return (assignee.patients[tag] && assignee.patients[tag].planned || 0)
    }).reduce(add, 0)

    return [ tag, { planned: sum } ]
  })

  return fromPairs(byTag)
}

const mapAssignees = ({ report }) => {
  return report.assignees.length
}

const mapHours = ({ report }) => {
  const planned = report.assignees.map((assignee) => {
    // Don't count any hours for unassigned appointments
    if (assignee.assigneeId === 'null') { return 0 }

    return assignee.hours.planned
  }).reduce(add, 0)

  return {
    planned
  }
}

export const mapTotal = ({ report }) => {
  const patients = mapPatients({ report })
  const assignees = mapAssignees({ report })
  const hours = mapHours({ report })

  return {
    assignees,
    hours,
    patients
  }
}
