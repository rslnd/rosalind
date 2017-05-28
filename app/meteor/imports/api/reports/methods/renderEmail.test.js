/* eslint-env mocha */
import { expect } from 'chai'
import dedent from 'dedent'
import {
  renderEmail,
  renderSummary,
  renderBody
} from './renderEmail'
import { report } from './report.fixture.js'

const NBSP = ' '
const equalizeWhitespace = s => s.replace(new RegExp(NBSP, 'g'), ' ')

const userIdToNameMapping = {
  '5a9NQhmscSy8xSf2v': 'Dr. A',
  'oFgkvix3fQ5AfgafF': 'Dr. B',
  'oMc9wy4zTspXqakyt': 'Dr. C',
  'o2jiKCH5qB4xn9Hdd': 'Dr. D',
  'fdCzzTGpCZF5SvsfQ': 'Dr. E'
}

const mapUserIdToName = userId => userIdToNameMapping[userId]

const mapAssigneeType = type => ({
  overbooking: 'Einschub',
  team: 'Team'
}[type])

describe('reports', () => {
  describe('renderEmail', () => {
    it('renders report title', () => {
      const rendered = renderEmail({ report, mapUserIdToName, mapAssigneeType })
      expect(rendered.title).to.include('Tagesbericht')
      expect(rendered.title).to.include('Umsatz')
      expect(rendered.title).to.include('Donnerstag, 18. Mai 2017')
      expect(equalizeWhitespace(rendered.title)).to.include('€ 5 859')
      expect(rendered.text).to.be.a('string')
    })

    it('renders summary', () => {
      const rendered = renderSummary({ report, mapUserIdToName, mapAssigneeType })
      expect(equalizeWhitespace(rendered)).to.include('Gesamtumsatz: € 5 859')
      expect(rendered).to.include('ÄrztInnen: 5')
      expect(rendered).to.include('Neu / Stunde: 6,2')
      expect(rendered).to.include('Auslastung: 86%')
    })

    it('renders assignee ranking', () => {
      const rendered = renderBody({ report, mapUserIdToName, mapAssigneeType })
      expect(equalizeWhitespace(rendered)).to.include(dedent`
      € 1 713
      Termine: 81%
      Neu / Stunde: 8,4
      PatientInnen: 43
      OPs: 5

      2 - Dr. B
      Umsatz: € 1 120
      Termine: 75%
      Neu / Stunde: 8,5
      PatientInnen: 36
      OPs: 1`)
    })
  })
})
