import identity from 'lodash/identity'
import uniqBy from 'lodash/fp/uniqBy'
import groupBy from 'lodash/groupBy'
import intersectionBy from 'lodash/intersectionBy'
import map from 'lodash/map'

export const containsTerms = terms => (collection = [], accessor = identity, { exact } = { exact: false }) =>
  collection.some(item => {
    const property = accessor(item)
    if (typeof property === 'string') {
      const haystack = property.toLowerCase().split(' ')
      return terms.some(t => haystack.some(h =>
        exact
        ? h === t
        : h.indexOf(t) === 0
      ))
    } else if (property && property.length) {
      return containsTerms(terms)(property)
    } else {
      return false
    }
  })

export const applySearchFilter = (props) => {
  const { constraints, searchValue } = props
  if (!searchValue) {
    return {
      constraintsMatchingAssignee: constraints,
      constraintsMatchingTag: constraints
    }
  }

  const terms = searchValue.toLowerCase().split(' ')
  const match = containsTerms(terms)

  const constraintsMatchingAssignee = constraints.filter(c =>
    match(c.assignees, a => a.fullNameWithTitle) ||
    match(c.assignees, a => a.username, { exact: true })
  )

  const constraintsMatchingTag = constraints.filter(c =>
    match(c.tags, t => t.tag) ||
    match(c.tags, t => t.synonyms) ||
    match(c.tags, t => t.description)
  )

  return {
    constraints: intersectionBy(constraintsMatchingAssignee, constraintsMatchingTag, c => c._id)
  }
}

export const explodeConstraints = ({
  constraints
}) => ({
})

const explode = (constraints, groupKey, singleKey) => {
  return constraints.reduce((acc, c) => {
    if (!c[groupKey] || c[groupKey].length === 0) {
      return acc // Not sure whether to keep c if not explodable
    }

    const exploded = c[groupKey].map(groupDoc => ({
      ...c,
      explodedBy: groupDoc._id,
      [singleKey]: groupDoc,
      key: [c._id, '-', groupDoc._id].join('')
    }))
    return [...acc, ...exploded]
  }, [])
}

export const combineConstraints = ({
  constraintsMatchingAssignee,
  constraintsMatchingTag
}) => {
  const combine = (combineBy, exploded) =>
    map(groupBy(exploded, 'explodedBy'),
      (constraints) => ({
        [combineBy]: constraints[0][combineBy],
        constraints
      })
    )

  return {
    constraintsMatchingAssignee: combine('assignee', constraintsMatchingAssignee),
    constraintsMatchingTag: combine('tag', constraintsMatchingTag)
  }
}
