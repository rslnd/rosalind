import map from 'lodash/map'

export const postprocessRevenue = revenue => {
  const assignees = map(revenue, mapAssignees)
  return { assignees }
}

const mapAssignees = ({ type, revenue }, assigneeId) => {
  const mappedRevenue = {
    revenue: {
      insurance: {
        actual: revenue
      }
    }
  }

  if (type) {
    return {
      type,
      ...mappedRevenue
    }
  } else {
    return {
      assigneeId,
      ...mappedRevenue
    }
  }
}
