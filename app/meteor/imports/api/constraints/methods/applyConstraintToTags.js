import identity from 'lodash/identity'

export const applyConstraintToTags = ({ constraint, tags = [] }) => {
  if (!constraint) { return tags }
  if (!constraint.tags) { return applyDefaultDuration(tags) }

  return constraint.tags.map(ct => {
    const { tagId, ...fieldsOverridenByConstraint } = ct
    const tag = tags.find(t => t._id === tagId)
    if (tag) {
      return {
        ...tag,
        ...fieldsOverridenByConstraint,

        // Only override duration from top level constraint duration if it
        // was not overwritten by any per-tag constraint
        ...(fieldsOverridenByConstraint.duration === undefined &&
          constraint.duration !== undefined &&
          { duration: constraint.duration })
      }
    }
  }).filter(identity)
}

const applyDefaultDuration = ({ constraint, tags }) => {
  if (constraint.duration === undefined) { return tags }

  return tags.map(tag => {
    return Object.assign(
      {},
      tag,
      tag.duration === undefined && constraint.duration !== undefined &&
        { duration: constraint.duration }
    )
  })
}
