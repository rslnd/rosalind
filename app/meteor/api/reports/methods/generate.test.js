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

const start = moment('2017-05-22T14:00:00').toDate()
const end = moment(start).add(5, 'minutes').toDate()

const appointments = [
  { id: '101', assigneeId: '1', tags: ['n3w', 'should_not_show_up_tag2'], start, end },
  { id: '102', assigneeId: '1', tags: ['2rg'], start, end },
  { id: '103', assigneeId: '1', tags: ['2rg'], start, end },
  { id: '104', assigneeId: '2', tags: ['n3w'], start, end },
  { id: '105', assigneeId: '2', tags: ['rc1'], start, end },
  { id: '106', assigneeId: '2', tags: ['2rg', 'should_not_show_up_tag3'], start, end },
  { id: '107', tags: ['n3w', 'should_not_show_up_tag1'], start, end }
]

const overrideSchedules = [
  { userId: '1', start: moment('2017-02-01T10:15:00.000'), end: moment('2017-02-01T12:15:00.000') },
  { userId: '2', start: moment('2017-02-01T10:15:00.000'), end: moment('2017-02-01T14:15:00.000') },
  { userId: '2', start: moment('2017-02-01T16:15:00.000'), end: moment('2017-02-01T17:15:00.000') }
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
            revenue: {},
            hours: {
              planned: 8.5
            },
            workload: {
              available: 102,
              planned: 3,
              actual: 0
            }
          },
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
            revenue: {},
            hours: {
              planned: 11.5
            },
            workload: {
              available: 138,
              planned: 3,
              actual: 0
            }
          },
          {
            patients: {
              total: {
                planned: 1
              },
              new: {
                planned: 1
              }
            },
            type: 'overbooking'
          }
        ],
        total: {
          assignees: 2,
          hours: {
            planned: 20
          },
          patients: {
            total: {
              planned: 7
            },
            new: {
              planned: 3
            },
            recall: {
              planned: 1
            },
            surgery: {
              planned: 3
            }
          },
          workload: {
            available: 240,
            planned: 6,
            actual: 0
          },
          revenue: {},
          noShows: {
            remindedCanceled: null,
            notRemindedCanceled: null,
            remindedNoShow: null,
            notRemindedNoShow: null,
            reminded: null,
            notReminded: null,
            canceled: null,
            noShows: null
          }
        },
        average: {
          patients: {
            total: {
              plannedPerHour: 7 / 20
            },
            new: {
              plannedPerHour: 3 / 20
            },
            recall: {
              plannedPerHour: 1 / 20
            },
            surgery: {
              plannedPerHour: 3 / 20
            }
          },
          revenue: {}
        }
      }

      expect(generatedReport).to.eql(expectedReport)
    })
  })
})
