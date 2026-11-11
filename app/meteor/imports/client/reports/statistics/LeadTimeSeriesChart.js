import React from 'react'
import { BRAND, ORANGE } from './flowPalette'
import { LeadTimeDaysChart } from './LeadTimeDaysChart'

// Lead-time distribution with named series (e.g. Online vs. Intern) at day
// resolution: x = exact days in advance (always the full two months), one line
// per series, coloured from the categorical blue/orange pair (CVD-safe).
//   distribution: { series: [{ label, max, counts }] }
const SERIES_COLORS = [BRAND, ORANGE]
const FALLBACK = '#9aa7b8'

const sum = arr => (arr || []).reduce((a, b) => a + b, 0)

export const LeadTimeSeriesChart = ({ distribution }) => {
  if (!distribution || !distribution.series) { return null }

  const cohorts = distribution.series
    .map((s, i) => ({ ...s, color: SERIES_COLORS[i] || FALLBACK }))
    .filter(s => sum(s.counts) > 0)
    .map(s => ({
      id: s.label,
      label: s.label,
      color: s.color,
      current: { leadDays: { max: s.max, counts: s.counts } }
    }))

  if (cohorts.length === 0) { return null }

  return <LeadTimeDaysChart cohorts={cohorts} labeledInfo fullRange />
}
