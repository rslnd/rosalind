import React from 'react'
import { __ } from '../../../i18n'
import { fmtInt, fmtPct, fmtNum } from './format'

const BAR_COLOR = '#256abf' // validated blue (dataviz)
const TRACK_COLOR = '#eef1f5'

const rowStyle = { display: 'flex', alignItems: 'center', marginBottom: 4, fontSize: 12 }
const nameStyle = { width: 150, flex: '0 0 150px', textAlign: 'right', paddingRight: 8, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const trackStyle = { flex: 1, background: TRACK_COLOR, borderRadius: 4, height: 14, position: 'relative' }
const valueStyle = { width: 64, flex: '0 0 64px', paddingLeft: 8, textAlign: 'right', color: '#333' }

// One horizontal bar per doctor for a single measure. Bars share a scale so
// doctors are directly comparable. Values are direct-labelled.
const BarGroup = ({ title, rows, format }) => {
  const values = rows.map(r => r.value).filter(v => v != null && !Number.isNaN(v))
  const max = values.length ? Math.max(...values) : 0

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.3, color: '#888', marginBottom: 6 }}>{title}</div>
      {rows.map((r) => {
        const pct = (max > 0 && r.value != null) ? Math.max(2, (r.value / max) * 100) : 0
        return (
          <div key={r.key} style={rowStyle}>
            <div style={nameStyle} title={r.name}>{r.name}</div>
            <div style={trackStyle}>
              <div style={{
                width: `${pct}%`, height: '100%', background: BAR_COLOR,
                borderRadius: 4, minWidth: r.value ? 3 : 0
              }} />
            </div>
            <div style={valueStyle}>{r.value == null ? '–' : format(r.value)}</div>
          </div>
        )
      })}
    </div>
  )
}

export const AssigneeBars = ({ assignees = [] }) => {
  if (assignees.length === 0) { return null }

  const rowsFor = (field) => assignees.map(a => ({
    key: (a.assigneeId || a.type) + field,
    name: a.name,
    value: a.current ? a.current[field] : null
  }))

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div style={{ flex: '1 1 320px', minWidth: 280 }}>
        <BarGroup title={__('reports.appointmentsTotal')} rows={rowsFor('total')} format={fmtInt} />
        <BarGroup title={__('reports.kept')} rows={rowsFor('admitted')} format={fmtInt} />
      </div>
      <div style={{ flex: '1 1 320px', minWidth: 280 }}>
        <BarGroup title={__('reports.slotUtilization')} rows={rowsFor('calendarSlotUtilization')} format={fmtPct} />
        <BarGroup title={__('reports.patientsPerHour')} rows={rowsFor('patientsPerHour')} format={fmtNum} />
      </div>
    </div>
  )
}
