/* eslint-env mocha */
import assert from 'assert'
import { leadDays, histogram, BINS, leadTimeDistribution } from './leadTimeDistribution'

const appt = (createdDaysBeforeStart) => {
  const start = new Date('2026-06-30T09:00:00Z')
  const createdAt = new Date(start.getTime() - createdDaysBeforeStart * 24 * 60 * 60 * 1000)
  return { start, createdAt }
}

describe('reports/methods/leadTimeDistribution', function () {
  it('leadDays floors and clamps negatives to 0', function () {
    assert.equal(leadDays(appt(0)), 0)
    assert.equal(leadDays(appt(5)), 5)
    assert.equal(leadDays({ start: new Date('2026-01-01'), createdAt: new Date('2026-01-02') }), 0)
    assert.equal(leadDays({ start: null, createdAt: new Date() }), null)
  })

  it('histogram bins and normalizes', function () {
    const appointments = [appt(0), appt(2), appt(2), appt(100)]
    const h = histogram(appointments)
    assert.equal(h.total, 4)
    assert.equal(h.counts[0], 1) // same day
    assert.equal(h.counts[1], 2) // 1-3 days
    assert.equal(h.counts[BINS.length - 1], 1) // > 3 months
    assert.equal(h.share[1], 2 / 4)
  })

  it('builds one series per year window', function () {
    const dist = leadTimeDistribution({
      yearWindows: [
        { year: 2026, appointments: [appt(1)] },
        { year: 2025, appointments: [appt(50), appt(50)] }
      ]
    })
    assert.equal(dist.bins.length, BINS.length)
    assert.equal(dist.series.length, 2)
    assert.equal(dist.series[0].year, 2026)
    assert.equal(dist.series[1].total, 2)
  })
})
