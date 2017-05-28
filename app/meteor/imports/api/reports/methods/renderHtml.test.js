/* eslint-env mocha */
import { expect } from 'chai'
import { renderHtml } from './renderHtml'
import { report } from './report.fixture.js'

const userIdToNameMapping = {
  '5a9NQhmscSy8xSf2v': 'Dr. A',
  'oFgkvix3fQ5AfgafF': 'Dr. B',
  'oMc9wy4zTspXqakyt': 'Dr. C',
  'o2jiKCH5qB4xn9Hdd': 'Dr. D',
  'fdCzzTGpCZF5SvsfQ': 'Dr. E'
}

const mapUserIdToName = userId => userIdToNameMapping[userId]

const __ = s => s

describe('reports', () => {
  describe('renderHtml', () => {
    it('renders report as html', () => {
      const rendered = renderHtml({ report, mapUserIdToName, __ })
      expect(rendered).to.include(report.total.assignees)
      expect(rendered).to.include(report.total.patients.total.actual)
      expect(rendered).to.include('Dr. E')
    })
  })
})
