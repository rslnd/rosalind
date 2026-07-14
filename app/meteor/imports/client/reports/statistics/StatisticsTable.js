import React from 'react'
import { __ } from '../../../i18n'
import { fmtInt, fmtNum, fmtHours, fmtPct } from './format'

// Per-doctor current-window figures (no year comparison — that is a separate table).
// Einschub (unassigned) is shown as its own row.
const columns = [
  { key: 'scheduledHours', label: __('reports.scheduledHours'), fmt: fmtHours },
  { key: 'calendarSlotUtilization', label: __('reports.slotUtilization'), fmt: fmtPct, hint: __('reports.slotUtilizationHint') },
  { key: 'total', label: __('reports.appointmentsTotal'), fmt: fmtInt },
  { key: 'admitted', label: __('reports.kept'), fmt: fmtInt },
  { key: 'insurance', label: __('reports.insurance'), fmt: fmtInt },
  { key: 'private', label: __('reports.privateShort'), fmt: fmtInt },
  { key: 'patientsPerHour', label: __('reports.patientsPerHour'), fmt: fmtNum, hint: __('reports.patientsPerHourHint') }
]

const Row = ({ name, metrics, muted }) => (
  <tr style={muted ? { fontStyle: 'italic', color: '#666' } : {}}>
    <td>{name}</td>
    {columns.map(col => (
      <td key={col.key} style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {metrics ? col.fmt(metrics[col.key]) : '–'}
      </td>
    ))}
  </tr>
)

export const StatisticsTable = ({ total, assignees = [] }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className='table table-condensed' style={{ fontSize: 13 }}>
      <thead>
        <tr>
          <th>{__('reports.assignee')}</th>
          {columns.map(col => (
            <th key={col.key} style={{ textAlign: 'right' }} title={col.hint}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr style={{ fontWeight: 700, background: '#fafafa' }}>
          <td>{__('reports.practiceTotal')}</td>
          {columns.map(col => (
            <td key={col.key} style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              {total ? col.fmt(total[col.key]) : '–'}
            </td>
          ))}
        </tr>
        {assignees.map(a => (
          <Row
            key={a.assigneeId || a.type}
            name={a.name}
            metrics={a.current}
            muted={a.type === 'einschub'} />
        ))}
      </tbody>
    </table>
  </div>
)
