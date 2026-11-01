/* eslint-env mocha */
import { assert } from 'chai'
import { defaultScheduleProblems, invalidDefaultSchedules } from './validateDefaultSchedule'

const calendar = { slotSize: 5, atMinutes: [0, 10, 15, 20, 30, 40, 45, 50] }

describe('validateDefaultSchedule', function () {
  it('accepts blocks on the grid', function () {
    assert.deepEqual(defaultScheduleProblems({ calendar, schedule: { from: { h: 8, m: 0 }, to: { h: 14, m: 45 } } }), [])
  })

  it('rejects boundaries off the atMinutes grid', function () {
    const problems = defaultScheduleProblems({ calendar, schedule: { from: { h: 8, m: 5 }, to: { h: 12, m: 0 } } })
    assert.equal(problems.length, 1)
    assert.include(problems[0], '8:05')
    assert.include(problems[0], 'Terminraster')
  })

  it('uses the slot size when there are no atMinutes', function () {
    const cal = { slotSize: 15 }
    assert.equal(defaultScheduleProblems({ calendar: cal, schedule: { from: { h: 8, m: 15 }, to: { h: 9, m: 45 } } }).length, 0)
    assert.equal(defaultScheduleProblems({ calendar: cal, schedule: { from: { h: 8, m: 10 }, to: { h: 9, m: 0 } } }).length, 1)
  })

  it('rejects an end before the start', function () {
    assert.equal(defaultScheduleProblems({ calendar, schedule: { from: { h: 12, m: 0 }, to: { h: 8, m: 0 } } }).length, 1)
  })

  it('lists invalid schedules', function () {
    const defaultSchedules = [
      { _id: 'a', weekday: 'tue', from: { h: 8, m: 0 }, to: { h: 12, m: 0 } },
      { _id: 'b', weekday: 'tue', from: { h: 13, m: 0 }, to: { h: 14, m: 55 } }
    ]
    assert.deepEqual(invalidDefaultSchedules({ calendar, defaultSchedules }).map(i => i.schedule._id), ['b'])
  })
})
