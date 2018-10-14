import identity from 'lodash/identity'

export const containsTerms = terms => (collection = [], accessor = identity) =>
  collection.some(item => {
    const property = accessor(item)
    if (typeof property === 'string') {
      const haystack = property.toLowerCase().split(' ')
      return terms.some(t => haystack.some(h => h.indexOf(t) === 0))
    } else if (property && property.length) {
      return containsTerms(terms)(property)
    } else {
      return false
    }
  })

export const applySearchFilter = (props) => {
  const { constraints, searchValue } = props
  if (!searchValue) { return props }
  const terms = searchValue.toLowerCase().split(' ')
  const match = containsTerms(terms)
  const filteredConstraints = constraints.filter(c =>
    match(c.assignees, a => a.fullNameWithTitle) ||
    match(c.tags, t => t.tag) ||
    match(c.tags, t => t.synonyms) ||
    match(c.tags, t => t.description)
  )

  return {
    ...props,
    searchValue,
    constraints: filteredConstraints
  }
}
