import identity from 'lodash/identity'
import add from 'lodash/add'
import some from 'lodash/fp/some'
import idx from 'idx'
import { assignedOnly, byTags, sumByKeys } from './util'
import { mapNoShows } from './mapNoShows'

const mapPatients = ({ report }) => (
  byTags(report.assignees, (tag) => {
    const perAssignee = report.assignees.map((assignee) => ({
      planned: assignee.patients[tag] && assignee.patients[tag].planned,
      actual: assignee.patients[tag] && assignee.patients[tag].actual
    }))

    const sum = sumByKeys(perAssignee, ['planned', 'actual'])

    return [ tag, sum ]
  })
)

const mapAssignees = ({ report }) => {
  return assignedOnly(report.assignees).length
}

const mapHours = ({ report }) => {
  const planned = assignedOnly(report.assignees)
    .map((a) => a.hours && a.hours.planned || 0)
    .reduce(add, 0)

  return {
    planned
  }
}

const mapWorkload = ({ report }) => {
  const workloads = assignedOnly(report.assignees).map(a => a.workload).filter(identity)
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

const mapRevenue = ({ report }) => {
  if (!some(a => idx(a, _ => _.revenue.total.actual))(report.assignees)) {
    return {}
  }

  const actual = report.assignees
    .map(a => idx(a, _ => _.revenue.total.actual) || 0)
    .reduce(add, 0)

  return {
    actual
  }
}

export const mapTotal = ({ report, appointments, messages }) => {
  const patients = mapPatients({ report })
  const assignees = mapAssignees({ report })
  const hours = mapHours({ report })
  const workload = mapWorkload({ report })
  const revenue = mapRevenue({ report })
  const noShows = mapNoShows({ report, appointments, messages })

  return {
    assignees,
    hours,
    patients,
    workload,
    revenue,
    noShows
  }
}
