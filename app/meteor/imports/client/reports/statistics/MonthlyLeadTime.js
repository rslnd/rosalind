import React from 'react'
import { __ } from '../../../i18n'
import { fmtNum } from './format'
import { BRAND, COMPARE, TEXT_COLOR } from './flowPalette'
import { GroupedBarChart } from './GroupedBarChart'

const MONTHS_DE = ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const monthShort = key => MONTHS_DE[Number(key.split('-')[1]) - 1]

const avgLead = m => (m && m.leadCount > 0 ? m.leadSum / m.leadCount : 0)
const days = v => `${fmtNum(v)} T`

const Legend = ({ color, label, numeric, bold }) => (
  <span style={{ marginRight: 14, whiteSpace: 'nowrap', fontSize: 12 }}>
    <span style={{ display: 'inline-block', width: 12, height: 12, background: color, borderRadius: 2, verticalAlign: 'middle', marginRight: 5 }} />
    <span style={{ color: TEXT_COLOR, fontWeight: bold ? 700 : 400 }}>{label}</span>
    {numeric && <span style={{ color: '#aaa', marginLeft: 4 }}>({numeric})</span>}
  </span>
)

// Average online-booking lead time (days) per month — Vorjahr left, current right.
export const MonthlyLeadTime = ({ months = [], previousMonths = null, periods = {} }) => {
  if (!months.length) { return null }
  const hasCompare = !!(previousMonths && previousMonths.length)
  const curLabel = (periods.current && periods.current.compact) || __('reports.currentPeriod')
  const prevLabel = periods.previous
    ? `${__('reports.comparePeriod')} ${periods.previous.compact}`
    : __('reports.comparePeriod')

  const categories = months.map(m => ({ key: m.month, label: monthShort(m.month) }))
  const series = [
    ...(hasCompare ? [{ id: 'prev', label: prevLabel, color: COMPARE, values: previousMonths.map(avgLead) }] : []),
    { id: 'cur', label: curLabel, color: BRAND, values: months.map(avgLead) }
  ]

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.3, color: '#888', marginBottom: 4 }}>
        {__('reports.monthlyLeadTitle')}
      </div>
      {hasCompare &&
        <div style={{ marginBottom: 6 }}>
          <Legend color={COMPARE} label={prevLabel} numeric={periods.previous && periods.previous.numeric} />
          <Legend color={BRAND} label={curLabel} numeric={periods.current && periods.current.numeric} bold />
        </div>}
      <GroupedBarChart categories={categories} series={series} yFormat={days} height={200}
        infoHideSeries ariaLabel={__('reports.monthlyLeadTitle')} />
    </div>
  )
}
