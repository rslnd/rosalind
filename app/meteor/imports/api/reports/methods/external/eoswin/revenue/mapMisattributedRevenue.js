import idx from 'idx'
import sum from 'lodash/sum'

const sumRevenue = addendum =>
  sum(addendum.assignees.map(a => a.revenue.total.actual))


export const mapMisattributedRevenue = ({ report, total }) => {
  const revenueAddendum = report.addenda.find(a => idx(a, _ => _.assignees[0].revenue.total.actual))

  if (revenueAddendum) {
    const actualRevenue = sumRevenue(revenueAddendum)
    const reportedRevenue = total.revenue.actual

    return actualRevenue - reportedRevenue
  }
}
