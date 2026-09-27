import React from 'react'
import { __ } from '../../../i18n'
import { fmtInt } from './format'
import { TEXT_COLOR, paleOf } from './flowPalette'
import { GroupedBarChart } from './GroupedBarChart'
import { monthUnion, monthLabel, byMonth } from './monthsAxis'

const Legend = ({ color, label, numeric, faded }) => (
  <span style={{ marginRight: 14, whiteSpace: 'nowrap', fontSize: 12, opacity: faded ? 0.85 : 1 }}>
    <span style={{ display: 'inline-block', width: 12, height: 12, background: color, borderRadius: 2, verticalAlign: 'middle', marginRight: 5 }} />
    <span style={{ color: TEXT_COLOR }}>{label}</span>
    {numeric && <span style={{ color: '#aaa', marginLeft: 4 }}>({numeric})</span>}
  </span>
)

// Monthly appointment volume (seasonal) for several cohorts on one shared month
// axis. Each cohort is one colored bar per month; with compare on, the cohort's
// previous-year volume is drawn as a paler bar right next to it.
export const MonthlyTrend = ({ cohorts = [], compare = false }) => {
  const categories = monthUnion(
    ...cohorts.map(c => c.current && c.current.months),
    ...(compare ? cohorts.map(c => c.previous && c.previous.months) : [])
  ).map(key => ({ key, label: monthLabel(key) }))
  if (!categories.length) { return null }

  const series = []
  cohorts.forEach(c => {
    const cur = byMonth(c.current && c.current.months, m => m.total)
    series.push({ id: `${c.id}-cur`, label: c.label, color: c.color, values: categories.map(cat => cur[cat.key] || 0) })
    if (compare && c.previous) {
      const prev = byMonth(c.previous.months, m => m.total)
      series.push({ id: `${c.id}-prev`, label: __('reports.cohortVorjahrSuffix', { label: c.label }), color: paleOf(c.color), values: categories.map(cat => prev[cat.key] || 0) })
    }
  })

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {cohorts.map(c => <Legend key={c.id} color={c.color} label={c.label} />)}
        {compare && <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>{__('reports.paleIsVorjahr')}</span>}
      </div>
      <GroupedBarChart categories={categories} series={series} yFormat={fmtInt} ariaLabel={__('reports.monthlyTitle')} />
    </div>
  )
}
