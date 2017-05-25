/* eslint-env mocha */
import { expect } from 'chai'
import { mapTotal } from './mapTotal'

const report = {
  assignees: [
    {
      assigneeId: '1',
      patients: {
        total: {
          planned: 3,
          actual: 1
        }
      }
    }
  ]
}

describe('reports', () => {
  describe('mapTotal', () => {
    it('counts assignees', () => {
      expect(mapTotal({ report }).assignees).to.equal(1)
    })

    it('counts total patients', () => {
      const total = mapTotal({ report })
      expect(total.patients.total.planned).to.equal(3)
      expect(total.patients.total.actual).to.equal(1)
    })
  })
})
