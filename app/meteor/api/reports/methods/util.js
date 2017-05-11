import flatten from 'lodash/flatten'
import uniq from 'lodash/uniq'
import fromPairs from 'lodash/fromPairs'

export const getTags = (assignees) => (
   uniq(flatten(assignees.map((assignee) => (
    Object.keys(assignee.patients)
  ))))
)

export const byTags = (assignees, iterator) => {
  const tags = getTags(assignees)
  const byTag = tags.map(iterator)
  return fromPairs(byTag)
}

export const assignedOnly = (assignees) => (
  assignees.filter(a => a.assigneeId)
)
