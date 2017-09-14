/* eslint-env mocha */
import { expect } from 'chai'
import { mapAverage } from './mapAverage'

describe('reports', () => {
  describe('mapAverage', () => {
    const report = {
      assignees: [
        { patients: { new: { actual: 6, planned: 3 } } },
        { patients: { new: { actual: 10, planned: 5 } } }
      ]
    }
    it('averages patient counts', () => {
      expect(mapAverage({ report })
        .patients.new.actual).to.equal(8)
      expect(mapAverage({ report })
        .patients.new.planned).to.equal(4)
    })
  })
})
