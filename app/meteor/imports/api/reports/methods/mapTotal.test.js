/* eslint-env mocha */
import { expect } from 'chai'
import { mapTotal, mapWorkload } from './mapTotal'

const report = {
  assignees: [
    {
      assigneeId: '1',
      patients: {
        total: {
          planned: 3,
          actual: 1,
          admitted: 0,
          canceled: 0,
          noShow: 1
        }
      },
      workload: {
        planned: 10
      }
    },
    {
      assigneeId: 2,
      workload: {
        planned: 5
      }
    }
  ]
}

describe('reports', () => {
  describe('mapTotal', () => {
    it('counts assignees', () => {
      expect(mapTotal({ report }).assignees).to.equal(2)
    })

    it('counts total patients', () => {
      const total = mapTotal({ report })
      expect(total.patients.total.planned).to.equal(3)
      expect(total.patients.total.actual).to.equal(1)
    })

    describe('mapWorkload', () => {
      const expected = mapWorkload({ report })
      expect(expected.planned).to.eql(15)
    })
  })
})
