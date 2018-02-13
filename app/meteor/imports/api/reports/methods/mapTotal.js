import identity from 'lodash/identity'
import add from 'lodash/add'
import sumBy from 'lodash/fp/sumBy'
import some from 'lodash/fp/some'
import idx from 'idx'
import { assignedOnly, byTags, sumByKeys } from './util'
import { mapMisattributedRevenue } from './external/eoswin/revenue/mapMisattributedRevenue'

const mapPatients = ({ report }) => {
  return byTags(assignedOnly(report.assignees), (tag) => {
    const perAssignee = assignedOnly(report.assignees).map((assignee) => ({
      planned: idx(assignee, _ => _.patients[tag].planned) || 0,
      expected: idx(assignee, _ => _.patients[tag].expected) || 0,
      actual: idx(assignee, _ => _.patients[tag].actual) || 0,
      admitted: idx(assignee, _ => _.patients[tag].admitted) || 0,
      noShow: idx(assignee, _ => _.patients[tag].noShow) || 0,
      canceled: idx(assignee, _ => _.patients[tag].canceled) || 0
    }))

    const sum = sumByKeys(perAssignee, ['planned', 'expected', 'actual', 'admitted', 'noShow', 'canceled'])

    return [ tag, sum ]
  })
}

const mapAssignees = ({ report }) => {
  return assignedOnly(report.assignees).length
}

const mapHours = ({ report }) => {
  const sum = accessor => assignedOnly(report.assignees)
    .map(a => accessor(a) || 0)
    .reduce(add, 0)

  const ids = accessor => assignedOnly(report.assignees)
    .filter(a => accessor(a) > 0)
    .map(a => a.assigneeId)

  return {
    planned: sum(a => idx(a, _ => _.hours.planned)),
    am: {
      planned: sum(a => idx(a, _ => _.hours.am.planned)),
      assignees: ids(a => idx(a, _ => _.hours.am.planned))
    },
    pm: {
      planned: sum(a => idx(a, _ => _.hours.pm.planned)),
      assignees: ids(a => idx(a, _ => _.hours.pm.planned))
    }
  }
}

const calculateWeightedWorkload = assignee => {
  const actual = idx(assignee, _ => _.patients.total.actual)
  const planned = idx(assignee, _ => _.patients.total.planned)
  if (actual && planned) {
    const value = ((actual ** 2) / planned)
    const weight = actual
    return { value, weight }
  }
}

const mapWeightedWorkload = ({ report }) => {
  const weightedworkloads = assignedOnly(report.assignees)
    .map(calculateWeightedWorkload)
    .filter(identity)

  const summedWeightedWorkloads = sumBy('value')(weightedworkloads)
  const summedWeights = sumBy('weight')(weightedworkloads)

  return summedWeightedWorkloads / summedWeights
}

export const mapWorkload = ({ report }) => {
  const sum = accessor => report.assignees
    .map(accessor)
    .reduce((acc, curr) => {
      return {
        available: (acc.available + (curr && curr.available)) || acc.available,
        planned: (acc.planned + (curr && curr.planned)) || acc.planned,
        actual: (acc.actual + (curr && curr.actual)) || acc.actual
      }
    }, { available: 0, planned: 0, actual: 0 })

  return {
    ...sum(a => a.workload),
    weighted: mapWeightedWorkload({ report }),
    am: sum(a => idx(a, _ => _.workload.am)),
    pm: sum(a => idx(a, _ => _.workload.pm))
  }
}

const mapRevenue = ({ report }) => {
  let revenues = {}

  report.assignees.map(a => {
    Object.keys(a.revenue).map(typeKey => {
      if (!revenues[typeKey]) {
        revenues[typeKey] = {}
      }

      Object.keys(a.revenue[typeKey]).map(valueKey => {
        if (!revenues[typeKey][valueKey]) {
          revenues[typeKey][valueKey] = 0
        }

        revenues[typeKey][valueKey] += a.revenue[typeKey][valueKey]
      })
    })
  })

  return revenues
}

const preprocess = ({ report }) => {
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

const postprocess = ({ report, total }) => {
  const attributed = idx(total, _ => _.revenue.actual)
  if (!attributed) { return total }

  const misattributed = mapMisattributedRevenue({ report, total }) || 0

  return {
    ...total,
    revenue: {
      ...total.revenue,
      misattributed,
      attributed,
      actual: misattributed + attributed
    }
  }
}

export const mapTotal = ({ report }) => {
  const total = preprocess({ report })
  return postprocess({ total, report })
}
