/* eslint-env mocha */
import { expect } from 'chai'
import { merge } from './merge'

describe('reports', () => {
  describe('merge', () => {
    it('merges assignees', () => {
      const originalReport = {
        assignees: [
          {
            assigneeId: '1',
            patients: {
              total: {
                planned: 3
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
            }
          }
        ]
      }


      const mergedReport = merge(originalReport, addendum)
      expect(mergedReport.assignees[0].patients.total.actual).to.equal(2)
    })
  })
})
