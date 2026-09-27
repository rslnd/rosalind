import React from 'react'
import { __ } from '../../../i18n'
import { fmtNum } from './format'
import { TEXT_COLOR, paleOf } from './flowPalette'
import { GroupedBarChart } from './GroupedBarChart'
import { monthUnion, monthLabel, byMonth } from './monthsAxis'

const avgLead = m => (m && m.leadCount > 0 ? m.leadSum / m.leadCount : 0)
const days = v => `${fmtNum(v)} T`

const Legend = ({ color, label }) => (
  <span style={{ marginRight: 14, whiteSpace: 'nowrap', fontSize: 12 }}>
    <span style={{ display: 'inline-block', width: 12, height: 12, background: color, borderRadius: 2, verticalAlign: 'middle', marginRight: 5 }} />
    <span style={{ color: TEXT_COLOR }}>{label}</span>
  </span>
)

// Average online-booking lead time (days) per month, one colored bar per cohort
// on the shared month axis; paler bar = Vorjahr when comparing.
export const MonthlyLeadTime = ({ cohorts = [], compare = false }) => {
  const categories = monthUnion(
    ...cohorts.map(c => c.current && c.current.months),
    ...(compare ? cohorts.map(c => c.previous && c.previous.months) : [])
  ).map(key => ({ key, label: monthLabel(key) }))
  if (!categories.length) { return null }

  const series = []
  cohorts.forEach(c => {
    const cur = byMonth(c.current && c.current.months, avgLead)
    series.push({ id: `${c.id}-cur`, label: c.label, color: c.color, values: categories.map(cat => cur[cat.key] || 0) })
    if (compare && c.previous) {
      const prev = byMonth(c.previous.months, avgLead)
      series.push({ id: `${c.id}-prev`, label: __('reports.cohortVorjahrSuffix', { label: c.label }), color: paleOf(c.color), values: categories.map(cat => prev[cat.key] || 0) })
    }
  })

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.3, color: '#888', marginBottom: 4 }}>
        {__('reports.monthlyLeadTitle')}
      </div>
      <div style={{ marginBottom: 6 }}>
        {cohorts.map(c => <Legend key={c.id} color={c.color} label={c.label} />)}
        {compare && <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>{__('reports.paleIsVorjahr')}</span>}
      </div>
      <GroupedBarChart categories={categories} series={series} yFormat={days} height={200}
        infoHideSeries ariaLabel={__('reports.monthlyLeadTitle')} />
    </div>
  )
}
