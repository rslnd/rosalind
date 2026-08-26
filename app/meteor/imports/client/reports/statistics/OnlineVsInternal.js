import React from 'react'
import { __ } from '../../../i18n'
import { fmtInt, fmtPct, Comparison } from './format'
import { BRAND, RED, TEXT_COLOR, PIE_ONLINE, PIE_INTERNAL } from './flowPalette'
import { GroupedBarChart } from './GroupedBarChart'

const MONTHS_DE = ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const monthShort = key => MONTHS_DE[Number(key.split('-')[1]) - 1]

const Legend = ({ color, label }) => (
  <span style={{ marginRight: 14, whiteSpace: 'nowrap', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
    <span style={{ display: 'inline-block', width: 12, height: 12, background: color, borderRadius: 2, marginRight: 5 }} />
    <span style={{ color: TEXT_COLOR }}>{label}</span>
  </span>
)

// --- pie geometry ---
const polar = (cx, cy, r, deg) => {
  const a = (deg - 90) * Math.PI / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}
const arc = (cx, cy, r, start, end) => {
  const [sx, sy] = polar(cx, cy, r, end)
  const [ex, ey] = polar(cx, cy, r, start)
  const large = (end - start) <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 0 ${ex} ${ey} Z`
}

// Full (filled) pie: online vs. internal. `pale` fades it (Vorjahr).
const Pie = ({ online, internal, pale }) => {
  const total = online + internal
  const share = total > 0 ? online / total : 0
  const cx = 80
  const cy = 80
  const r = 76
  const onlineDeg = share * 360
  const op = pale ? 0.42 : 1

  let slices
  if (total === 0) {
    slices = [<circle key='e' cx={cx} cy={cy} r={r} fill='#e5e8ec' />]
  } else if (share >= 0.999) {
    slices = [<circle key='o' cx={cx} cy={cy} r={r} fill={PIE_ONLINE} fillOpacity={op} />]
  } else if (share <= 0.001) {
    slices = [<circle key='i' cx={cx} cy={cy} r={r} fill={PIE_INTERNAL} fillOpacity={op} />]
  } else {
    slices = [
      <path key='o' d={arc(cx, cy, r, 0, onlineDeg)} fill={PIE_ONLINE} fillOpacity={op}><title>{`${__('reports.onlineBooked')}: ${fmtInt(online)} (${fmtPct(share)})`}</title></path>,
      <path key='i' d={arc(cx, cy, r, onlineDeg, 360)} fill={PIE_INTERNAL} fillOpacity={op}><title>{`${__('reports.internalBooked')}: ${fmtInt(internal)} (${fmtPct(1 - share)})`}</title></path>
    ]
  }

  return (
    <svg viewBox='0 0 160 160' style={{ width: 140, height: 140, flex: '0 0 auto' }} role='img'
      aria-label={__('reports.onlineTitle')}>
      {slices}
    </svg>
  )
}

// One pie with heading (compact + numeric) and its numbers beside it. `compare`
// (previous values) adds the "vs. Vorjahr" comparison lines under the numbers.
const PieBlock = ({ label, online, internal, pale, compare }) => {
  const total = online + internal
  const onlineShare = total > 0 ? online / total : 0
  const NumRow = ({ color, text, count, share }) => (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, marginBottom: 4 }}>
      <span style={{ display: 'inline-block', width: 12, height: 12, background: color, borderRadius: 2, marginRight: 6, flex: '0 0 auto', opacity: pale ? 0.5 : 1 }} />
      <span style={{ color: TEXT_COLOR, marginRight: 6 }}>{text}</span>
      <strong style={{ marginRight: 4 }}>{fmtInt(count)}</strong>
      <span style={{ color: '#999' }}>({fmtPct(share)})</span>
    </div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
      <Pie online={online} internal={internal} pale={pale} />
      <div>
        {label &&
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#555' }}>{label.compact}</div>
            {label.numeric && <div style={{ fontSize: 11, color: '#999' }}>{label.numeric}</div>}
          </div>}
        <NumRow color={PIE_ONLINE} text={__('reports.onlineBooked')} count={online} share={onlineShare} />
        <NumRow color={PIE_INTERNAL} text={__('reports.internalBooked')} count={internal} share={total > 0 ? 1 - onlineShare : 0} />
        {compare &&
          <div style={{ fontSize: 12, marginTop: 4 }}>
            <span style={{ color: TEXT_COLOR, marginRight: 6 }}>{__('reports.onlineShare')}:</span>
            <Comparison current={onlineShare} previous={compare.onlineShare} kind='pct' />
          </div>}
      </div>
    </div>
  )
}

// Online (portal) vs. internally booked appointments: pie(s) (Vorjahr left &
// paler when comparison is on) and the monthly online/internal composition as a
// stacked bar (internal drawn as the red complement).
export const OnlineVsInternal = ({ current, previous, months = [], periods = {} }) => {
  if (!current) { return null }
  const hasCompare = !!previous

  // Vorjahr labels carry the word "Vorjahr" in front of their date.
  const prevLabelObj = periods.previous
    ? { compact: `${__('reports.comparePeriod')} ${periods.previous.compact}`, numeric: periods.previous.numeric }
    : null
  const curLabelText = periods.current && periods.current.compact
  const prevLabelText = prevLabelObj && prevLabelObj.compact

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap', marginBottom: 18 }}>
        {hasCompare &&
          <PieBlock label={prevLabelObj} online={previous.online || 0} internal={previous.internal || 0} pale />}
        <PieBlock label={hasCompare ? periods.current : null}
          online={current.online || 0} internal={current.internal || 0}
          compare={hasCompare ? previous : null} />
      </div>

      {months.length > 0 &&
        <OnlineMonthlyStacked
          months={months}
          previousMonths={hasCompare ? (previous.months || []) : null}
          currentLabel={curLabelText}
          previousLabel={prevLabelText} />}
    </div>
  )
}

const subHeading = { fontSize: 12, fontWeight: 700, color: '#555', margin: '10px 0 4px' }

// Paler online/internal colors for the Vorjahr chart.
const ONLINE_PALE = '#9ec3ea'
const INTERNAL_PALE = '#e3a99f'

const stackedChart = (data, pale) => {
  const categories = data.map(m => ({ key: m.month, label: monthShort(m.month) }))
  const series = [
    { id: 'online', label: __('reports.onlineBooked'), color: pale ? ONLINE_PALE : BRAND, values: data.map(m => m.online) },
    { id: 'internal', label: __('reports.internalBooked'), color: pale ? INTERNAL_PALE : RED, values: data.map(m => m.internal) }
  ]
  return (
    <GroupedBarChart categories={categories} series={series} stacked yFormat={fmtInt} height={210}
      ariaLabel={__('reports.onlineShareTrend')} />
  )
}

// Monthly online/internal composition, stacked (online blue + internal red).
// When comparing, the Vorjahr chart (paler) is shown first, then the current one.
const OnlineMonthlyStacked = ({ months, previousMonths, currentLabel, previousLabel }) => {
  const hasCompare = !!(previousMonths && previousMonths.length)

  return (
    <div>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.3, color: '#888', marginBottom: 4 }}>
        {__('reports.onlineShareTrend')}
      </div>
      <div style={{ marginBottom: 6 }}>
        <Legend color={BRAND} label={__('reports.onlineBooked')} />
        <Legend color={RED} label={__('reports.internalBooked')} />
      </div>

      {hasCompare &&
        <div>
          {previousLabel && <div style={subHeading}>{previousLabel}</div>}
          {stackedChart(previousMonths, true)}
        </div>}

      {hasCompare && currentLabel &&
        <div style={subHeading}>{currentLabel}</div>}
      {stackedChart(months, false)}
    </div>
  )
}
