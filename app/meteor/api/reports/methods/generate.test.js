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
  { id: '101', assigneeId: '1', tags: ['n3w', 'should_not_show_up_tag2'] },
  { id: '102', assigneeId: '1', tags: ['2rg'] },
  { id: '103', assigneeId: '1', tags: ['2rg'] },
  { id: '104', assigneeId: '2', tags: ['n3w'] },
  { id: '105', assigneeId: '2', tags: ['rc1'] },
  { id: '106', assigneeId: '2', tags: ['2rg', 'should_not_show_up_tag3'] },
  { id: '107', tags: ['n3w', 'should_not_show_up_tag1'] }
]

const overrideSchedules = [
  { assigneeId: '1', start: moment('2017-02-01T10:15:00.000'), end: moment('2017-02-01T12:15:00.000') },
  { assigneeId: '2', start: moment('2017-02-01T10:15:00.000'), end: moment('2017-02-01T14:15:00.000') },
  { assigneeId: '2', start: moment('2017-02-01T16:15:00.000'), end: moment('2017-02-01T17:15:00.000') }
]

const tagMapping = {
  'n3w': 'new',
  '2rg': 'surgery',
  'rc1': 'recall'
}

describe('reports', () => {
  describe('generate', () => {
    it('generates report', () => {
      const generatedReport = generate({ day, appointments, overrideSchedules, tagMapping })

      const expectedReport = {
        day,
        assignees: [
          {
            assigneeId: '1',
            patients: {
              total: {
                planned: 3,
                plannedPerHour: 3 / 11.5
              },
              new: {
                planned: 1,
                plannedPerHour: 1 / 11.5
              },
              surgery: {
                planned: 2,
                plannedPerHour: 2 / 11.5
              }
            },
            hours: {
              planned: 11.5
            },
            workload: {
              available: 138,
              planned: 3
            }
          },
          {
            assigneeId: '2',
            patients: {
              total: {
                planned: 3,
                plannedPerHour: 3 / 8.5
              },
              new: {
                planned: 1,
                plannedPerHour: 1 / 8.5
              },
              recall: {
                planned: 1,
                plannedPerHour: 1 / 8.5
              },
              surgery: {
                planned: 1,
                plannedPerHour: 1 / 8.5
              }
            },
            hours: {
              planned: 8.5
            },
            workload: {
              available: 102,
              planned: 3
            }
          }, {
            assigneeId: 'null',
            patients: {
              total: {
                planned: 1,
                plannedPerHour: 1 / 13.5
              },
              new: {
                planned: 1,
                plannedPerHour: 1 / 13.5
              }
            },
            hours: {
              planned: 13.5
            },
            workload: {
              available: 162,
              planned: 1
            }
          }
        ],
        total: {
          assignees: 3,
          hours: {
            planned: 20
          },
          patients: {
            total: {
              planned: 6
            },
            new: {
              planned: 2
            },
            surgery: {
              planned: 3
            },
            recall: {
              planned: 1
            }
          }
        }
      }

      expect(generatedReport).to.eql(expectedReport)
    })
  })
})
