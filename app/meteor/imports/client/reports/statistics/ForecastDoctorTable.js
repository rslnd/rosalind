import React from 'react'
import { __ } from '../../../i18n'
import { fmtInt, fmtHours, fmtPct } from './format'

// Free calendar slots = planned capacity not yet taken.
const freeSlots = m => {
  if (!m || m.slotsAvailable == null || m.slotsUsed == null) { return null }
  return Math.max(0, m.slotsAvailable - m.slotsUsed)
}

// Per-doctor forecast for the selected day: who is present, their roster hours,
// free vs. booked calendar slots, insurance/private appointments and utilization.
const columns = [
  { key: 'scheduledHours', label: __('reports.scheduledHours'), get: m => m.scheduledHours, fmt: fmtHours },
  { key: 'free', label: __('reports.free'), get: freeSlots, fmt: fmtInt },
  { key: 'booked', label: __('reports.booked'), get: m => m.slotsUsed, fmt: fmtInt },
  { key: 'insurance', label: __('reports.insurance'), get: m => m.insurance, fmt: fmtInt },
  { key: 'private', label: __('reports.privateShort'), get: m => m.private, fmt: fmtInt },
  { key: 'utilization', label: __('reports.utilization'), get: m => m.calendarSlotUtilization, fmt: fmtPct, hint: __('reports.slotUtilizationHint') }
]

const Row = ({ name, metrics, muted, strong }) => (
  <tr style={{ ...(muted ? { fontStyle: 'italic', color: '#666' } : {}), ...(strong ? { fontWeight: 700, background: '#fafafa' } : {}) }}>
    <td>{name}</td>
    {columns.map(col => (
      <td key={col.key} style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {metrics ? col.fmt(col.get(metrics)) : '–'}
      </td>
    ))}
  </tr>
)

export const ForecastDoctorTable = ({ total, assignees = [] }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className='table table-condensed' style={{ fontSize: 13 }}>
      <thead>
        <tr>
          <th>{__('reports.present')}</th>
          {columns.map(col => (
            <th key={col.key} style={{ textAlign: 'right' }} title={col.hint}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <Row name={__('reports.practiceTotal')} metrics={total} strong />
        {assignees.map(a => (
          <Row
            key={a.assigneeId || a.type}
            name={a.name}
            metrics={a.metrics}
            muted={a.type === 'einschub'} />
        ))}
      </tbody>
    </table>
  </div>
)
