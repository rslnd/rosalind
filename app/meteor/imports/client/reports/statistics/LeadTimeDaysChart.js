import React from 'react'
import { __ } from '../../../i18n'
import { fmtPct } from './format'
import { AXIS_COLOR, TEXT_COLOR, HOVER_STROKE, paleOf } from './flowPalette'

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

const Legend = ({ color, label, faded }) => (
  <span style={{ marginRight: 14, whiteSpace: 'nowrap', fontSize: 12, display: 'inline-flex', alignItems: 'center', opacity: faded ? 0.85 : 1 }}>
    <span style={{ display: 'inline-block', width: 22, height: 0, borderTop: `${faded ? 2 : 2.5}px ${faded ? 'dashed' : 'solid'} ${color}`, marginRight: 5 }} />
    <span style={{ color: TEXT_COLOR }}>{label}</span>
  </span>
)

const sum = arr => (arr || []).reduce((a, b) => a + b, 0)

const infoText = (percent, days) => {
  if (days === 0) { return __('reports.leadInfoSameDay', { percent }) }
  return __('reports.leadInfoDays', { percent, count: days })
}

// Booking lead time at day resolution for online appointments, one line per
// cohort (+ a paler dashed Vorjahr line when comparing). X = exact days in
// advance (cut at 2 months), Y = number of bookings. Crosshair follows the
// cursor, snaps to the day, and lists each cohort's share for that day.
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
    const { cohorts = [], compare = false } = this.props

    // Flatten to drawable lines: each cohort's current line, plus a paler dashed
    // Vorjahr line when comparing. Keep totals for share readouts.
    const lines = []
    cohorts.forEach(c => {
      const cur = c.current && c.current.leadDays
      if (cur && cur.counts) {
        lines.push({ id: `${c.id}-cur`, label: c.label, color: c.color, counts: cur.counts, max: cur.max || 0, total: sum(cur.counts), dashed: false, width: 2.5 })
      }
      if (compare && c.previous && c.previous.leadDays && c.previous.leadDays.counts) {
        const p = c.previous.leadDays
        lines.push({ id: `${c.id}-prev`, label: __('reports.cohortVorjahrSuffix', { label: c.label }), color: paleOf(c.color), counts: p.counts, max: p.max || 0, total: sum(p.counts), dashed: true, width: 1.5 })
      }
    })

    const anyData = lines.some(l => l.counts.some(v => v > 0))
    if (!anyData) {
      return <p className='text-muted'>{__('reports.statisticsEmpty')}</p>
    }

    const dataMax = Math.max(2, ...lines.map(l => l.max))
    const max = Math.min(MAX_DAYS, dataMax)
    this._max = max

    const countAt = (arr, d) => (arr && arr[d]) || 0
    const rawYMax = Math.max(1, ...lines.reduce((acc, l) => acc.concat(l.counts.slice(0, max + 1)), []))
    const yMax = Math.ceil(rawYMax / 5) * 5 || 5

    const xFor = d => plotLeft + (max > 0 ? d / max : 0) * plotW
    const yFor = v => plotBottom - (v / yMax) * plotH

    const pointsOf = (arr) => {
      const pts = []
      for (let d = 0; d <= max; d++) { pts.push(`${xFor(d)},${yFor(countAt(arr, d))}`) }
      return pts.join(' ')
    }

    const yTicks = [0, 0.5, 1].map(f => Math.round(f * yMax))
    const labelStep = 7
    const minorTicks = []
    for (let d = 0; d <= max; d++) { minorTicks.push(d) }

    const hover = this.state.hover
    const hoverDay = hover ? hover.day : null

    // Info box: one row per line with that day's share of its own total.
    let info = null
    if (hover) {
      const rows = lines.map((l, i) => {
        const share = l.total > 0 ? countAt(l.counts, hoverDay) / l.total : 0
        return {
          color: l.color,
          bold: !l.dashed,
          text: i === 0 && !l.dashed
            ? infoText(fmtPct(share), hoverDay)
            : `${l.label}: ${fmtPct(share)}`
        }
      })
      const lineH = 15
      const padY = 5
      const boxH = rows.length * lineH + padY * 2 - 3
      const boxW = Math.min(VIEW_W - 8, Math.max(...rows.map(r => r.text.length)) * 6.0 + 30)
      let bx = xFor(hoverDay) + 12
      if (bx + boxW > plotRight) { bx = xFor(hoverDay) - 12 - boxW }
      if (bx < plotLeft) { bx = plotLeft }
      let by = hover.vy - boxH / 2
      by = Math.max(plotTop, Math.min(plotBottom - boxH, by))
      info = { rows, bx, by, boxW, boxH, lineH, padY }
    }

    return (
      <div style={{ pageBreakInside: 'avoid' }}>
        <div style={{ marginBottom: 8 }}>
          {lines.map(l => <Legend key={l.id} color={l.color} label={l.label} faded={l.dashed} />)}
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

          {/* Vorjahr (dashed) lines first, current lines on top */}
          {lines.filter(l => l.dashed).map(l => (
            <polyline key={l.id} points={pointsOf(l.counts)} fill='none' stroke={l.color} strokeWidth={l.width}
              strokeDasharray='5 3' strokeLinejoin='round' strokeLinecap='round' />
          ))}
          {lines.filter(l => !l.dashed).map(l => (
            <polyline key={l.id} points={pointsOf(l.counts)} fill='none' stroke={l.color} strokeWidth={l.width}
              strokeLinejoin='round' strokeLinecap='round' />
          ))}

          {hover && (
            <g pointerEvents='none'>
              <line x1={xFor(hoverDay)} y1={plotTop} x2={xFor(hoverDay)} y2={plotBottom} stroke={HOVER_STROKE} strokeWidth={0.75} strokeDasharray='2 3' opacity={0.7} />
              {lines.map(l => (
                <circle key={l.id} cx={xFor(hoverDay)} cy={yFor(countAt(l.counts, hoverDay))} r={l.dashed ? 3 : 4} fill={l.color} stroke='#fff' strokeWidth={1} />
              ))}
              <rect x={info.bx} y={info.by} width={info.boxW} height={info.boxH} rx={3} fill={HOVER_STROKE} opacity={0.94} />
              {info.rows.map((r, i) => (
                <g key={i}>
                  <rect x={info.bx + 7} y={info.by + info.padY + i * info.lineH + 3} width={9} height={9} rx={2} fill={r.color} />
                  <text x={info.bx + 20} y={info.by + info.padY + i * info.lineH + 11} fontSize='11' fontWeight={r.bold ? 700 : 600} fill='#fff'>{r.text}</text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
    )
  }
}
