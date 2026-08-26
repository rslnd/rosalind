import React from 'react'
import { __ } from '../../../i18n'
import { blueFor, textOn, EMPTY_CELL, TEXT_COLOR } from './flowPalette'

// German short weekday labels, Monday-first (matches matrix row order).
const WD_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const pad2 = h => (h < 10 ? `0${h}` : `${h}`)

const cellBase = {
  textAlign: 'center',
  fontSize: 13,
  fontWeight: 500,
  padding: '8px 4px',
  minWidth: 42,
  height: 36,
  borderRadius: 3,
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact'
}

// Weekday × hour heatmap of appointment volume. HTML-table based so it is
// naturally accessible and prints well; magnitude uses the sequential blue ramp.
export const HeatmapWeekHour = ({ heatmap, pale }) => {
  if (!heatmap || !heatmap.matrix) { return null }
  const matrix = heatmap.matrix

  // Only show the hour columns that carry any volume (fallback 8–18).
  let min = 24
  let max = -1
  let peak = 0
  matrix.forEach(row => row.forEach((v, h) => {
    if (v > 0) {
      if (h < min) { min = h }
      if (h > max) { max = h }
      if (v > peak) { peak = v }
    }
  }))
  if (max < 0) {
    return <p className='text-muted'>{__('reports.statisticsEmpty')}</p>
  }
  min = Math.min(min, 8)
  max = Math.max(max, 18)

  const hours = []
  for (let h = min; h <= max; h++) { hours.push(h) }

  // Top 3 Stoßzeiten (busiest weekday/hour cells).
  const cells = []
  matrix.forEach((row, wd) => row.forEach((v, h) => { if (v > 0) { cells.push({ wd, h, v }) } }))
  const topPeaks = cells.sort((a, b) => b.v - a.v).slice(0, 3)

  return (
    <div>
      {topPeaks.length > 0 &&
        <p style={{ marginTop: 0 }}>
          {__('reports.peakTopLabel')}:{' '}
          {topPeaks.map((c, i) => (
            <span key={`${c.wd}-${c.h}`}>
              {i > 0 && ' · '}
              <strong>{WD_LABELS[c.wd]} {pad2(c.h)}:00–{pad2(c.h + 1)}:00</strong> ({__('reports.peakCount', { count: c.v })})
            </span>
          ))}
        </p>}

      <div style={{ overflowX: 'auto', opacity: pale ? 0.55 : undefined }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 3, minWidth: 680 }}>
          <thead>
            <tr>
              <th />
              {hours.map(h => (
                <th key={h} style={{ fontSize: 12, fontWeight: 500, color: TEXT_COLOR, textAlign: 'center', paddingBottom: 4 }}>
                  {pad2(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, wd) => (
              <tr key={wd}>
                <th style={{ fontSize: 13, fontWeight: 600, color: TEXT_COLOR, paddingRight: 8, textAlign: 'right' }}>
                  {WD_LABELS[wd]}
                </th>
                {hours.map(h => {
                  const v = row[h] || 0
                  const t = peak > 0 ? v / peak : 0
                  return (
                    <td key={h}
                      title={`${WD_LABELS[wd]} ${pad2(h)}:00 – ${v}`}
                      style={{
                        ...cellBase,
                        background: v > 0 ? blueFor(t) : EMPTY_CELL,
                        color: v > 0 ? textOn(t) : '#ccc'
                      }}>
                      {v > 0 ? v : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
