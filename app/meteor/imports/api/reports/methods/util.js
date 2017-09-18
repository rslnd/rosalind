import flatten from 'lodash/flatten'
import uniq from 'lodash/uniq'
import fromPairs from 'lodash/fromPairs'

export const getTags = (assignees) => (
   uniq(
     flatten(assignees
      .filter(a => a.patients)
      .map(assignee =>
        Object.keys(assignee.patients)
      )
    )
  )
)

export const byTags = (assignees, iterator) => {
  const tags = getTags(assignees)
  const byTag = tags.map(iterator)
  return fromPairs(byTag)
}

export const assignedOnly = (assignees) => (
  assignees.filter(a => a.assigneeId)
)

export const sumByKeys = (array, properties) => {
  return array.reduce((prev, curr) => {
    const parts = { ...prev }

    properties.map((property) => {
      if (curr[property] && parts[property]) {
        parts[property] += curr[property]
      } else if (curr[property]) {
        parts[property] = curr[property]
      }
    })

    return parts
  }, {})
}
