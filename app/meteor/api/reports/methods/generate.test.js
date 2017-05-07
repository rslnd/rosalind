/* eslint-env mocha */
import { expect } from 'chai'
import momentTz from 'moment-timezone'
import { extendMoment } from 'moment-range'
import { generate } from './generate'

const moment = extendMoment(momentTz)

const day = {
  day: 12,
  month: 4,
  year: 2017
}

const appointments = [
  { id: '101', assigneeId: '1', tag: 'A' },
  { id: '102', assigneeId: '1', tag: 'A' },
  { id: '103', assigneeId: '1', tag: 'B' },
  { id: '104', assigneeId: '2', tag: 'A' },
  { id: '105', assigneeId: '2', tag: 'B' },
  { id: '106', assigneeId: '2', tag: 'B' }
]

describe('reports', () => {
  describe('generate', () => {
    it('generates report', () => {
      const generatedReport = generate({ day, appointments })

      const expectedReport = {
        day,
        assignees: [
          {
            assigneeId: '1',
            patients: {
              total: {
                planned: 3
              }
            }
          },
          {
            assigneeId: '2',
            patients: {
              total: {
                planned: 3
              }
            }
          }
        ],
        total: {}
      }

      expect(generatedReport).to.eql(expectedReport)
    })
  })
})
