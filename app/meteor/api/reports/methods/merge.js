import idx from 'idx'
import isEqual from 'lodash/isEqual'
import find from 'lodash/find'
import cloneDeep from 'lodash/cloneDeep'
import mergeDeep from 'lodash/merge'
import sortBy from 'lodash/fp/sortBy'

const mergeAssignee = (originalAssignee, addendumAssignee) => (
  mergeDeep(
    cloneDeep(originalAssignee),
    addendumAssignee
  )
)

const mergeAssignees = (report, addendum) => {
  if (!addendum.assignees) {
    return report.assignees
  }

  // Only merge additional data for assignees that are already present in the original report
  const assigneeIdsToMerge = report.assignees.map(a => a.assigneeId)

  const mergedAssignees = report.assignees.map((originalAssignee) => {
    if (assigneeIdsToMerge.includes(originalAssignee.assigneeId)) {
      const addendumAssignee = find(addendum.assignees, a => a.assigneeId === originalAssignee.assigneeId)
      return mergeAssignee(originalAssignee, addendumAssignee)
    } else {
      return originalAssignee
    }
  })

  const sortedAssignees = sortBy(a => a.assigneeId ? 1 : 0)(
    sortBy(a => idx(a, _ => _.revenue.total.actual))(mergedAssignees)
  ).reverse()

  return sortedAssignees
}

export const merge = (report, addendum) => {
  if (addendum.day && !isEqual(addendum.day, report.day)) {
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
