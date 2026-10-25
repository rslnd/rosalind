import React from 'react'
import { BRAND, ORANGE, AXIS_COLOR, TEXT_COLOR } from './flowPalette'

// Lead-time distribution with named series (e.g. Online vs. Intern) drawn in one
// graph. Mirrors LeadTimeChart, but series are keyed by `label` and coloured from
// the categorical blue/orange pair (CVD-safe) instead of the year recency ramp.
const SERIES_COLORS = [BRAND, ORANGE]
const FALLBACK = '#9aa7b8'

const VIEW_W = 820
const VIEW_H = 340
const M = { left: 44, right: 92, top: 16, bottom: 54 }
const plotLeft = M.left
const plotRight = VIEW_W - M.right
const plotTop = M.top
const plotBottom = VIEW_H - M.bottom
const plotW = plotRight - plotLeft
const plotH = plotBottom - plotTop

const nf1 = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 1 })
const pct = v => `${nf1.format(v * 100)} %`

const colorFor = i => SERIES_COLORS[i] || FALLBACK

export const LeadTimeSeriesChart = ({ distribution }) => {
  if (!distribution || !distribution.bins || !distribution.series) { return null }

  const bins = distribution.bins
  const series = distribution.series.filter(s => s.total > 0)

  if (series.length === 0 || bins.length === 0) { return null }

  const rawMax = Math.max(...series.map(s => Math.max(...s.share)))
  const yMax = Math.min(1, Math.max(0.1, Math.ceil(rawMax / 0.1) * 0.1))

  const xFor = i => plotLeft + (bins.length > 1 ? (i / (bins.length - 1)) : 0) * plotW
  const yFor = v => plotBottom - (v / yMax) * plotH

  const pointsFor = s => s.share.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ')

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => f * yMax)

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {series.map((s, i) => (
          <span key={s.label} style={{ marginRight: 14, fontSize: 12, whiteSpace: 'nowrap' }}>
            <span style={{
              display: 'inline-block', width: 22, height: 0,
              borderTop: `3px solid ${colorFor(i)}`,
              verticalAlign: 'middle', marginRight: 5
            }} />
            <span style={{ color: TEXT_COLOR }}>{s.label} <small className='text-muted'>(n={s.total})</small></span>
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: '100%', height: 'auto' }} role='img'
        aria-label='Vorlaufzeit Online vs. intern'>
        {/* y gridlines + labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={plotLeft} y1={yFor(v)} x2={plotRight} y2={yFor(v)}
              stroke={AXIS_COLOR} strokeWidth={i === 0 ? 1 : 0.5} strokeDasharray={i === 0 ? '' : '3 3'} />
            <text x={plotLeft - 6} y={yFor(v) + 3} textAnchor='end' fontSize='10' fill={TEXT_COLOR}>
              {pct(v)}
            </text>
          </g>
        ))}

        {/* x labels */}
        {bins.map((label, i) => (
          <text key={i} x={xFor(i)} y={plotBottom + 16} textAnchor='middle' fontSize='9' fill={TEXT_COLOR}>
            {label}
          </text>
        ))}

        {/* series lines */}
        {series.map((s, i) => (
          <polyline key={s.label} points={pointsFor(s)} fill='none'
            stroke={colorFor(i)} strokeWidth={2.5}
            strokeLinejoin='round' strokeLinecap='round' />
        ))}

        {/* direct label each series at its line end */}
        {series.map((s, i) => (
          <text key={s.label}
            x={xFor(bins.length - 1) + 6}
            y={yFor(s.share[bins.length - 1]) + 3}
            fontSize='11' fontWeight='700' fill={colorFor(i)}>
            {s.label}
          </text>
        ))}
      </svg>

      {/* Accessible data table (also the print-friendly table view) */}
      <table className='table table-condensed' style={{ fontSize: 11, marginTop: 8 }}>
        <thead>
          <tr>
            <th />
            {bins.map((label, i) => <th key={i} style={{ textAlign: 'right' }}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.label}>
              <td>{s.label} <small className='text-muted'>(n={s.total})</small></td>
              {s.share.map((v, j) => (
                <td key={j} style={{ textAlign: 'right' }}>{pct(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
