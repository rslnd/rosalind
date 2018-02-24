export const withRevenue = {
  addenda: 0
}

export const withoutRevenue = {
  ...withRevenue,
  'total.revenue': 0,
  'total.revenuePerAssignee': 0,
  'assignees.revenue': 0,
  'average.revenue': 0
}
