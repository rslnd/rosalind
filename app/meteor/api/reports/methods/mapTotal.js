import add from 'lodash/add'
import { assignedOnly, byTags } from './util'

const mapPatients = ({ report }) => (
  byTags(report.assignees, (tag) => {
    const sum = report.assignees.map((assignee) => (
      assignee.patients[tag] && assignee.patients[tag].planned || 0
    )).reduce(add, 0)
    return [ tag, { planned: sum } ]
  })
)

const mapAssignees = ({ report }) => {
  return assignedOnly(report.assignees).length
}

const mapHours = ({ report }) => {
  const planned = assignedOnly(report.assignees)
    .map((a) => a.hours.planned)
    .reduce(add, 0)

  return {
    planned
  }
}

const mapWorkload = ({ report }) => {
  const workloads = assignedOnly(report.assignees).map(a => a.workload)
  const { available, planned } = workloads.reduce((prev, curr) => {
    return {
      available: prev.available + curr.available,
      planned: prev.planned + curr.planned
    }
  }, {
    available: 0,
    planned: 0
  })

  return {
    available,
    planned
  }
}

export const mapTotal = ({ report }) => {
  const patients = mapPatients({ report })
  const assignees = mapAssignees({ report })
  const hours = mapHours({ report })
  const workload = mapWorkload({ report })

  return {
    assignees,
    hours,
    patients,
    workload
  }
}
