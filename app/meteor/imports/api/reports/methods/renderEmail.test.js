/* eslint-env mocha */
import { expect } from 'chai'
import {
  renderEmail,
  renderSummary,
  renderBody
} from './renderEmail'
import { report } from './report.fixture.js'

const reports = [ report ]
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

const mapCalendar = calendarId => ({ name: 'Insurance' })

describe('reports', () => {
  describe('renderEmail', () => {
    it('renders report title', () => {
      const rendered = renderEmail({ reports, mapUserIdToName, mapAssigneeType, mapCalendar })
      expect(rendered.title).to.include('Tagesbericht')
      expect(rendered.title).to.include('Umsatz')
      expect(rendered.title).to.include('Donnerstag, 18. Mai 2017')
      expect(equalizeWhitespace(rendered.title)).to.include('€ 5 859')
      expect(rendered.text).to.be.a('string')
    })

    it('renders summary', () => {
      const rendered = renderSummary({ report, mapUserIdToName, mapAssigneeType, mapCalendar })
      expect(equalizeWhitespace(rendered)).to.include('Gesamtumsatz: € 5 859')
    })

    it('renders assignee ranking', () => {
      const rendered = renderBody({ report, mapUserIdToName, mapAssigneeType, mapCalendar })
      expect(equalizeWhitespace(rendered)).to.include(`1 - Dr. A
Umsatz: € 1 713
Neu / Stunde: 8,4`)
    })
  })
})
