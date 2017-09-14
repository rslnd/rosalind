import identity from 'lodash/identity'
import add from 'lodash/add'
import sumBy from 'lodash/fp/sumBy'
import some from 'lodash/fp/some'
import idx from 'idx'
import { assignedOnly, byTags, sumByKeys } from './util'

const mapPatients = ({ report }) => (
  byTags(report.assignees, (tag) => {
    const perAssignee = report.assignees.map((assignee) => ({
      planned: assignee.patients[tag] && assignee.patients[tag].planned,
      expected: assignee.patients[tag] && assignee.patients[tag].expected,
      actual: assignee.patients[tag] && assignee.patients[tag].actual,
      admitted: assignee.patients[tag] && assignee.patients[tag].admitted,
      noShow: assignee.patients[tag] && assignee.patients[tag].noShow,
      canceled: assignee.patients[tag] && assignee.patients[tag].canceled
    }))

    const sum = sumByKeys(perAssignee, ['planned', 'expected', 'actual', 'admitted', 'noShow', 'canceled'])

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

const calculateWorkload = assignee => {
  const actual = idx(assignee, _ => _.patients.total.actual)
  const planned = idx(assignee, _ => _.patients.total.planned)
  if (actual && planned) {
    const value = ((actual ** 2) / planned)
    const weight = actual
    return { value, weight }
  }
}

const mapWorkload = ({ report }) => {
  const workloads = assignedOnly(report.assignees)
    .map(calculateWorkload)
    .filter(identity)

  const summedWorkloads = sumBy('value')(workloads)
  const summedWeights = sumBy('weight')(workloads)

  return summedWorkloads / summedWeights
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

  return {
    assignees,
    hours,
    patients,
    workload,
    revenue
  }
}
