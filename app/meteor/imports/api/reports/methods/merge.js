import idx from 'idx'
import find from 'lodash/find'
import cloneDeep from 'lodash/cloneDeep'
import mergeDeep from 'lodash/merge'
import sortBy from 'lodash/fp/sortBy'
import { isSame } from '../../../util/time/day'

const mergeAssignee = (originalAssignee, addendumAssignee) => (
  mergeDeep(
    cloneDeep(originalAssignee),
    addendumAssignee
  )
)

const isSameAssignee = a => b =>
  (a.assigneeId && b.assigneeId && a.assigneeId === b.assigneeId) ||
  (a.type && b.type && a.type === b.type)

const mergeAssignees = (report, addendum) => {
  if (!addendum.assignees) {
    return report.assignees
  }

  // Only merge additional data for assignees that are already present in the original report
  const mergedAssignees = report.assignees.map(originalAssignee => {
    const addendumAssignee = find(addendum.assignees, isSameAssignee(originalAssignee))

    if (addendumAssignee) {
      return mergeAssignee(originalAssignee, addendumAssignee)
    } else {
      return originalAssignee
    }
  })

  // Now add special assignees from addendum to report if they aren't already present
  addendum.assignees.filter(a => a.type).map(addendumAssignee => {
    const found = find(mergedAssignees, a => a.type === addendumAssignee.type)
    if (!found) {
      mergedAssignees.push(addendumAssignee)
    }
  })

  // Recalculate totals
  const talliedAssignees = mergedAssignees.map(a => {
    if (a.revenue) {
      return {
        ...a,
        revenue: {
          ...a.revenue,
          total: sumRevenues(a.revenue)
        }
      }
    } else {
      return a
    }
  })

  const sortedAssignees = sortBy(a => ((a.assigneeId && !a.type) ? 1 : 0))(
    sortBy(a => idx(a, _ => _.revenue.total.actual))(talliedAssignees)
  ).reverse()

  return sortedAssignees
}

export const merge = (report, addendum) => {
  if (addendum.day && !isSame(addendum.day, report.day)) {
    throw new Error(`Attempting to merge reports of different days:
      Original: ${JSON.stringify(report.day)},
      Addendum: ${JSON.stringify(addendum.day)}`)
  }

  const assignees = mergeAssignees(report, addendum)

  return {
    ...report,
    assignees
  }
}

const sumRevenues = revenues => {
  const { total, ...revenuesWithoutTotal } = revenues
  let newTotal = {}

  const privateOrInsurance = Object.keys(revenuesWithoutTotal)
  privateOrInsurance.map(typeKey => {
    const plannedOrActual = Object.keys(revenuesWithoutTotal[typeKey])
    plannedOrActual.map(valueKey => {
      if (!newTotal[valueKey]) {
        newTotal[valueKey] = 0
      }
      newTotal[valueKey] += revenuesWithoutTotal[typeKey][valueKey]
    })
  })

  return newTotal
}
