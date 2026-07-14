import React from 'react'
import { __ } from '../../../i18n'

// Blue ordinal ramp (validated: scripts/validate_palette.js --ordinal --mode light).
// Most recent year = darkest/boldest; years beyond the recent four fall back to grey.
const RECENT_RAMP = ['#0d366b', '#256abf', '#3987e5', '#86b6ef']
const OLDER_COLOR = '#b4b4b4'
const AXIS_COLOR = '#ccc'
const TEXT_COLOR = '#666'

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

const colorFor = (recencyIndex) =>
  recencyIndex < RECENT_RAMP.length ? RECENT_RAMP[recencyIndex] : OLDER_COLOR

export const LeadTimeChart = ({ distribution }) => {
  if (!distribution || !distribution.bins || !distribution.series) { return null }

  const bins = distribution.bins
  const series = distribution.series
    .filter(s => s.total > 0)
    .slice()
    .sort((a, b) => b.year - a.year) // recent first

  if (series.length === 0 || bins.length === 0) { return null }

  const rawMax = Math.max(...series.map(s => Math.max(...s.share)))
  const yMax = Math.min(1, Math.max(0.1, Math.ceil(rawMax / 0.1) * 0.1))

  const xFor = i => plotLeft + (bins.length > 1 ? (i / (bins.length - 1)) : 0) * plotW
  const yFor = v => plotBottom - (v / yMax) * plotH

  const pointsFor = s => s.share.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ')

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => f * yMax)

  // Draw older series first so the most recent lands on top.
  const drawOrder = series.map((s, i) => ({ s, i })).reverse()
  const current = series[0]

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        {series.map((s, i) => (
          <span key={s.year} style={{ marginRight: 14, fontSize: 12, whiteSpace: 'nowrap' }}>
            <span style={{
              display: 'inline-block', width: 22, height: 0,
              borderTop: `${i === 0 ? 3 : 2}px solid ${colorFor(i)}`,
              verticalAlign: 'middle', marginRight: 5
            }} />
            <span style={{ color: TEXT_COLOR, fontWeight: i === 0 ? 700 : 400 }}>{s.year}</span>
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: '100%', height: 'auto' }} role='img'
        aria-label={__('reports.leadTimeTitle')}>
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
        {drawOrder.map(({ s, i }) => (
          <polyline key={s.year} points={pointsFor(s)} fill='none'
            stroke={colorFor(i)} strokeWidth={i === 0 ? 2.5 : 1.5}
            strokeLinejoin='round' strokeLinecap='round' />
        ))}

        {/* direct label the current year at the line end */}
        {current && (
          <text
            x={xFor(bins.length - 1) + 6}
            y={yFor(current.share[bins.length - 1]) + 3}
            fontSize='11' fontWeight='700' fill={RECENT_RAMP[0]}>
            {current.year}
          </text>
        )}
      </svg>

      {/* Accessible data table (also the print-friendly table view) */}
      <table className='table table-condensed' style={{ fontSize: 11, marginTop: 8 }}>
        <thead>
          <tr>
            <th>{__('reports.previousYear')}</th>
            {bins.map((label, i) => <th key={i} style={{ textAlign: 'right' }}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {series.map((s, i) => (
            <tr key={s.year} style={{ fontWeight: i === 0 ? 700 : 400 }}>
              <td>{s.year} <small className='text-muted'>(n={s.total})</small></td>
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
