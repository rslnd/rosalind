import React from 'react'
import { __ } from '../../../i18n'
import { fmtPct } from './format'
import { BRAND, ORANGE, AXIS_COLOR, TEXT_COLOR, HOVER_STROKE } from './flowPalette'

const VIEW_W = 820
const VIEW_H = 300
const M = { left: 40, right: 16, top: 24, bottom: 46 }
const plotLeft = M.left
const plotRight = VIEW_W - M.right
const plotTop = M.top
const plotBottom = VIEW_H - M.bottom
const plotW = plotRight - plotLeft
const plotH = plotBottom - plotTop

// Cut the axis off at two months, as requested.
const MAX_DAYS = 60

const Legend = ({ color, label, numeric, bold }) => (
  <span style={{ marginRight: 14, whiteSpace: 'nowrap', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
    <span style={{ display: 'inline-block', width: 22, height: 0, borderTop: `${bold ? 3 : 2}px solid ${color}`, marginRight: 5 }} />
    <span style={{ color: TEXT_COLOR, fontWeight: bold ? 700 : 400 }}>{label}</span>
    {numeric && <span style={{ color: '#aaa', marginLeft: 4 }}>({numeric})</span>}
  </span>
)

const sum = arr => (arr || []).reduce((a, b) => a + b, 0)

const infoText = (percent, days) => {
  if (days === 0) { return __('reports.leadInfoSameDay', { percent }) }
  return __('reports.leadInfoDays', { percent, count: days })
}

// Booking lead time at day resolution for online appointments. X = exact days
// in advance (cut at 2 months), Y = number of bookings. Current (blue) vs.
// comparison (gelborange). Crosshair follows the cursor, snaps to the day, and
// shows a live sentence like "20 % der Termine wurden 3 Tage vorher gebucht".
export class LeadTimeDaysChart extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hover: null } // { day, vx, vy }
    this.onMove = this.onMove.bind(this)
    this.onLeave = this.onLeave.bind(this)
  }

  onMove (e) {
    const max = this._max || 1
    const rect = e.currentTarget.getBoundingClientRect()
    const vx = (e.clientX - rect.left) * (VIEW_W / rect.width)
    const vy = (e.clientY - rect.top) * (VIEW_H / rect.height)
    let day = Math.round((vx - plotLeft) / plotW * max)
    day = Math.max(0, Math.min(max, day))
    this.setState({ hover: { day, vx, vy } })
  }

  onLeave () { if (this.state.hover) { this.setState({ hover: null }) } }

  render () {
    const { current, previous, periods = {} } = this.props
    if (!current || !current.counts) { return null }
    const hasCompare = !!(previous && previous.counts && previous.counts.some(c => c > 0))
    const hasCurrent = current.counts.some(c => c > 0)
    if (!hasCurrent && !hasCompare) {
      return <p className='text-muted'>{__('reports.statisticsEmpty')}</p>
    }

    const curLabel = (periods.current && periods.current.compact) || __('reports.currentPeriod')
    const prevLabel = periods.previous
      ? `${__('reports.comparePeriod')} ${periods.previous.compact}`
      : __('reports.comparePeriod')

    const dataMax = Math.max(2, current.max || 0, hasCompare ? (previous.max || 0) : 0)
    const max = Math.min(MAX_DAYS, dataMax)
    this._max = max

    const countAt = (arr, d) => (arr && arr[d]) || 0
    // Totals over the full (uncapped) distribution so shares are correct.
    const curTotal = sum(current.counts)
    const rawYMax = Math.max(1,
      ...current.counts.slice(0, max + 1),
      ...(hasCompare ? previous.counts.slice(0, max + 1) : [0]))
    const yMax = Math.ceil(rawYMax / 5) * 5 || 5

    const xFor = d => plotLeft + (max > 0 ? d / max : 0) * plotW
    const yFor = v => plotBottom - (v / yMax) * plotH

    const points = (arr) => {
      const pts = []
      for (let d = 0; d <= max; d++) { pts.push(`${xFor(d)},${yFor(countAt(arr, d))}`) }
      return pts.join(' ')
    }

    const yTicks = [0, 0.5, 1].map(f => Math.round(f * yMax))
    // Finer x markings: minor tick each day, labels weekly.
    const labelStep = 7
    const minorTicks = []
    for (let d = 0; d <= max; d++) { minorTicks.push(d) }

    const hover = this.state.hover
    const hoverDay = hover ? hover.day : null
    const hoverCount = hoverDay != null ? countAt(current.counts, hoverDay) : 0
    const hoverShare = curTotal > 0 ? hoverCount / curTotal : 0

    const prevTotal = hasCompare ? sum(previous.counts) : 0
    const hoverPrevCount = (hover && hasCompare) ? countAt(previous.counts, hoverDay) : 0
    const hoverPrevShare = prevTotal > 0 ? hoverPrevCount / prevTotal : 0

    // Info box anchored on the current value line (along the y-value crosshair),
    // following the cursor horizontally. One row per period when comparing.
    let info = null
    if (hover) {
      const rows = [{ color: BRAND, text: infoText(fmtPct(hoverShare), hoverDay) }]
      if (hasCompare) { rows.push({ color: ORANGE, text: `${prevLabel}: ${fmtPct(hoverPrevShare)}` }) }
      const lineH = 15
      const padY = 5
      const boxH = rows.length * lineH + padY * 2 - 3
      const boxW = Math.min(VIEW_W - 8, Math.max(...rows.map(r => r.text.length)) * 6.0 + 30)
      let bx = xFor(hoverDay) + 12
      if (bx + boxW > plotRight) { bx = xFor(hoverDay) - 12 - boxW }
      if (bx < plotLeft) { bx = plotLeft }
      // Always at the cursor's height.
      let by = hover.vy - boxH / 2
      by = Math.max(plotTop, Math.min(plotBottom - boxH, by))
      info = { rows, bx, by, boxW, boxH, lineH, padY }
    }

    return (
      <div>
        <div style={{ marginBottom: 8 }}>
          {hasCompare && <Legend color={ORANGE} label={prevLabel} numeric={periods.previous && periods.previous.numeric} />}
          <Legend color={BRAND} label={curLabel} numeric={periods.current && periods.current.numeric} bold />
        </div>

        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: '100%', height: 'auto' }} role='img'
          aria-label={__('reports.leadTimeTitle')} onMouseMove={this.onMove} onMouseLeave={this.onLeave}>
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={plotLeft} y1={yFor(v)} x2={plotRight} y2={yFor(v)}
                stroke={AXIS_COLOR} strokeWidth={i === 0 ? 1 : 0.5} strokeDasharray={i === 0 ? '' : '3 3'} />
              <text x={plotLeft - 6} y={yFor(v) + 3} textAnchor='end' fontSize='10' fill={TEXT_COLOR}>{v}</text>
            </g>
          ))}

          {/* minor + labelled x ticks */}
          {minorTicks.map(d => (
            <line key={`t${d}`} x1={xFor(d)} y1={plotBottom} x2={xFor(d)} y2={plotBottom + (d % labelStep === 0 ? 6 : 3)}
              stroke={AXIS_COLOR} strokeWidth={0.5} />
          ))}
          {minorTicks.filter(d => d % labelStep === 0).map(d => (
            <text key={`l${d}`} x={xFor(d)} y={plotBottom + 18} textAnchor='middle' fontSize='9' fill={TEXT_COLOR}>{d}</text>
          ))}
          <text x={(plotLeft + plotRight) / 2} y={VIEW_H - 4} textAnchor='middle' fontSize='10' fill={TEXT_COLOR}>
            {__('reports.leadDaysAxis')}
          </text>

          {hasCompare &&
            <polyline points={points(previous.counts)} fill='none' stroke={ORANGE} strokeWidth={1.5} strokeLinejoin='round' strokeLinecap='round' />}
          <polyline points={points(current.counts)} fill='none' stroke={BRAND} strokeWidth={2.5} strokeLinejoin='round' strokeLinecap='round' />

          {/* crossing crosshair + live info anchored on the value line */}
          {hover && (
            <g pointerEvents='none'>
              <line x1={xFor(hoverDay)} y1={plotTop} x2={xFor(hoverDay)} y2={plotBottom} stroke={HOVER_STROKE} strokeWidth={0.75} strokeDasharray='2 3' opacity={0.7} />
              <line x1={plotLeft} y1={yFor(hoverCount)} x2={plotRight} y2={yFor(hoverCount)} stroke={HOVER_STROKE} strokeWidth={0.75} strokeDasharray='2 3' opacity={0.7} />
              {hasCompare &&
                <circle cx={xFor(hoverDay)} cy={yFor(hoverPrevCount)} r={4} fill={ORANGE} stroke='#fff' strokeWidth={1} />}
              <circle cx={xFor(hoverDay)} cy={yFor(hoverCount)} r={4} fill={BRAND} stroke='#fff' strokeWidth={1} />
              <rect x={info.bx} y={info.by} width={info.boxW} height={info.boxH} rx={3} fill={HOVER_STROKE} opacity={0.94} />
              {info.rows.map((r, i) => (
                <g key={i}>
                  <rect x={info.bx + 7} y={info.by + info.padY + i * info.lineH + 3} width={9} height={9} rx={2} fill={r.color} />
                  <text x={info.bx + 20} y={info.by + info.padY + i * info.lineH + 11} fontSize='11' fontWeight={i === 0 ? 700 : 600} fill='#fff'>{r.text}</text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
    )
  }
}
