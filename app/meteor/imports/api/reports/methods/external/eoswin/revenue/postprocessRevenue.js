import map from 'lodash/map'

export const postprocessRevenue = revenue => {
  const assignees = map(revenue, mapAssignees)
  return { assignees }
}

const mapAssignees = (value, assigneeId) => {
  return {
    assigneeId,
    revenue: {
      total: {
        actual: value
      }
    }
  }
}
