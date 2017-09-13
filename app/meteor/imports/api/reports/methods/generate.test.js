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
  { id: '101', patientId: '4', assigneeId: '1', tags: ['n3w', 'should_not_show_up_tag2'], start, end },
  { id: '102', patientId: '5', assigneeId: '1', tags: ['2rg'], start, end },
  { id: '103', patientId: '6', assigneeId: '1', tags: ['2rg'], start, end },
  { id: '104', patientId: '7', assigneeId: '2', tags: ['n3w'], start, end },
  { id: '105', patientId: '8', assigneeId: '2', tags: ['rc1'], start, end },
  { id: '106', patientId: '9', assigneeId: '2', tags: ['2rg', 'should_not_show_up_tag3'], start, end },
  { id: '107', patientId: '10', tags: ['n3w', 'should_not_show_up_tag1'], start, end }
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
    const fieldsPerTag = ({ planned, hours, admitted = 0, canceled = 0, noShow = 0 }) => {
      noShow = noShow || planned
      if (!hours) { return { planned, admitted, canceled, noShow } }
      return {
        planned,
        plannedPerHour: planned / hours,
        admitted,
        admittedPerHour: admitted / hours,
        canceled,
        canceledPerHour: canceled / hours,
        noShow,
        noShowPerHour: noShow / hours
      }
    }

    const expectedReport = {
      day,
      assignees: [
        {
          assigneeId: '2',
          patients: {
            total: fieldsPerTag({ planned: 3, hours: 8.5 }),
            new: fieldsPerTag({ planned: 1, hours: 8.5 }),
            recall: fieldsPerTag({ planned: 1, hours: 8.5 }),
            surgery: fieldsPerTag({ planned: 1, hours: 8.5 })
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
            total: fieldsPerTag({ planned: 3, hours: 11.5 }),
            new: fieldsPerTag({ planned: 1, hours: 11.5 }),
            surgery: fieldsPerTag({ planned: 2, hours: 11.5 })
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
            total: fieldsPerTag({ planned: 1 }),
            new: fieldsPerTag({ planned: 1 })
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
            planned: 7,
            noShow: 7
          },
          new: {
            planned: 3,
            noShow: 3
          },
          recall: {
            planned: 1,
            noShow: 1
          },
          surgery: {
            planned: 3,
            noShow: 3
          }
        },
        workload: {
          available: 240,
          planned: 6,
          actual: 0
        },
        revenue: {}
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

    it('generates report', () => {
      const generatedReport = generate({ day, appointments, overrideSchedules, tagMapping })
      expect(generatedReport).to.eql(expectedReport)
    })

    const addendum = {
      day,
      assignees: [
        {
          assigneeId: '2',
          patients: {
            total: {
              actual: 9000
            }
          }
        }
      ]
    }

    it('merges addendum', () => {
      const generatedReport = generate({ day, appointments, overrideSchedules, tagMapping, addendum })
      expect(generatedReport.addenda).to.eql([ addendum ])
      expect(generatedReport.assignees[1].patients.total.actual).to.eql(9000)
    })

    it('merges two addenda', () => {
      const existingReport = generate({ day, appointments, overrideSchedules, tagMapping, addendum })

      const nextAddendum = {
        day,
        assignees: [
          {
            assigneeId: '2',
            revenue: {
              total: {
                actual: 1000
              }
            }
          }
        ]
      }

      const generatedReport = generate({ day, appointments, overrideSchedules, tagMapping, addendum: nextAddendum, existingReport })

      expect(generatedReport.assignees[1].patients.total.actual).to.eql(9000)
      expect(generatedReport.assignees[1].revenue.total.actual).to.eql(1000)
      expect(generatedReport.addenda).to.eql([ addendum, nextAddendum ])
    })
  })
})
