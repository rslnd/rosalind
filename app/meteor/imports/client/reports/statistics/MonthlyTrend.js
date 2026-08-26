import React from 'react'
import { __ } from '../../../i18n'
import { fmtInt } from './format'
import { BRAND, COMPARE, TEXT_COLOR } from './flowPalette'
import { GroupedBarChart } from './GroupedBarChart'

const MONTHS_DE = ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const monthLabel = (key) => {
  const [y, m] = key.split('-')
  return `${MONTHS_DE[Number(m) - 1]} ${y.slice(2)}`
}

const Legend = ({ color, label, numeric, bold }) => (
  <span style={{ marginRight: 14, whiteSpace: 'nowrap', fontSize: 12 }}>
    <span style={{ display: 'inline-block', width: 12, height: 12, background: color, borderRadius: 2, verticalAlign: 'middle', marginRight: 5 }} />
    <span style={{ color: TEXT_COLOR, fontWeight: bold ? 700 : 400 }}>{label}</span>
    {numeric && <span style={{ color: '#aaa', marginLeft: 4 }}>({numeric})</span>}
  </span>
)

// Monthly appointment volume (seasonal). Comparison period is drawn as the left
// bar of each month, the current period as the right bar. Legends use the
// concrete periods (compact form, e.g. "Q3 2025").
export const MonthlyTrend = ({ months = [], previousMonths = null, periods = {} }) => {
  if (!months.length) { return null }
  const hasCompare = !!(previousMonths && previousMonths.length)
  const curLabel = (periods.current && periods.current.compact) || __('reports.currentPeriod')
  const prevLabel = periods.previous
    ? `${__('reports.comparePeriod')} ${periods.previous.compact}`
    : __('reports.comparePeriod')

  const categories = months.map(m => ({ key: m.month, label: monthLabel(m.month) }))
  const series = [
    ...(hasCompare ? [{ id: 'prev', label: prevLabel, color: COMPARE, values: previousMonths.map(m => m.total) }] : []),
    { id: 'cur', label: curLabel, color: BRAND, values: months.map(m => m.total) }
  ]

  return (
    <div>
      {hasCompare &&
        <div style={{ marginBottom: 8 }}>
          <Legend color={COMPARE} label={prevLabel} numeric={periods.previous && periods.previous.numeric} />
          <Legend color={BRAND} label={curLabel} numeric={periods.current && periods.current.numeric} bold />
        </div>}
      <GroupedBarChart categories={categories} series={series} yFormat={fmtInt} ariaLabel={__('reports.monthlyTitle')} />
    </div>
  )
}
