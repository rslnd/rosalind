/* eslint-env mocha */
import { expect } from 'chai'
import { merge } from './merge'

describe('reports', () => {
  describe('merge', () => {
    it('handles empty addendum', () => {
      expect(merge({ assignees: [] }, { assignees: [] })).to.eql({ assignees: [] })
    })

    const originalReport = {
      assignees: [
        {
          assigneeId: '1',
          patients: {
            total: {
              planned: 3
            }
          },
          revenue: {
            private: {
              actual: 60
            }
          }
        }
      ]
    }

    const addendum = {
      assignees: [
        {
          assigneeId: '1',
          patients: {
            total: {
              actual: 2
            }
          },
          revenue: {
            insurance: {
              actual: 40
            }
          }
        }
      ]
    }

    it('merges assignees', () => {
      const mergedReport = merge(originalReport, addendum)
      expect(mergedReport.assignees[0].patients.total.actual).to.equal(2)
      expect(mergedReport.assignees[0].revenue.total.actual).to.equal(100)
    })

    const addendum2 = {
      assignees: [
        {
          assigneeId: '1',
          patients: {
            total: {
              other: 1
            }
          },
          revenue: {
            insurance: {
              actual: 1000
            }
          }
        }
      ]
    }

    it('merges multiple properties', () => {
      const mergedReport = merge(originalReport, addendum)
      const mergedReport2 = merge(mergedReport, addendum2)
      expect(mergedReport2.assignees[0].patients.total.actual).to.equal(2)
      expect(mergedReport2.assignees[0].patients.total.other).to.equal(1)
      expect(mergedReport2.assignees[0].revenue.insurance.actual).to.equal(1000)
    })
  })
})
