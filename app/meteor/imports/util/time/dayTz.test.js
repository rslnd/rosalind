/* eslint-env mocha */
import { assert } from 'chai'
import moment from 'moment-timezone'
import { dayBounds, rangeToDaysInTz, rangeBounds } from './day'

describe('day helpers in the practice timezone', function () {
  beforeEach(() => moment.tz.setDefault('UTC')) // like the server
  afterEach(() => moment.tz.setDefault())

  it('dayBounds spans the Vienna day', function () {
    const { start, end } = dayBounds({ year: 2026, month: 11, day: 3 })
    assert.equal(start.toISOString(), '2026-11-02T23:00:00.000Z')
    assert.equal(end.toISOString(), '2026-11-03T22:59:59.999Z')
  })

  it('rangeToDaysInTz does not include the previous day', function () {
    // Tue 3 Nov 00:00 Vienna – Wed 4 Nov 23:59 Vienna
    const days = rangeToDaysInTz({ from: new Date('2026-11-02T23:00:00Z'), to: new Date('2026-11-04T22:59:59.999Z') })
    assert.deepEqual(days, [{ year: 2026, month: 11, day: 3 }, { year: 2026, month: 11, day: 4 }])
  })

  it('rangeToDaysInTz skips Sundays', function () {
    const days = rangeToDaysInTz({ from: new Date('2026-10-31T23:00:00Z'), to: new Date('2026-11-02T22:59:59.999Z') })
    assert.deepEqual(days, [{ year: 2026, month: 11, day: 2 }]) // Sun 1 Nov skipped
  })

  it('rangeBounds', function () {
    const { start, end } = rangeBounds({ from: new Date('2026-11-03T10:00:00Z'), to: new Date('2026-11-03T10:00:00Z') })
    assert.equal(start.toISOString(), '2026-11-02T23:00:00.000Z')
    assert.equal(end.toISOString(), '2026-11-03T22:59:59.999Z')
  })
})
