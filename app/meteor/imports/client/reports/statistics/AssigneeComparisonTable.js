import React from 'react'
import { __ } from '../../../i18n'
import { Metric } from './format'

// Per-doctor 30-day figures compared with the same 30 days one year ago.
const columns = [
  { key: 'total', label: __('reports.appointmentsTotal'), kind: 'int' },
  { key: 'admitted', label: __('reports.kept'), kind: 'int' },
  { key: 'calendarSlotUtilization', label: __('reports.slotUtilization'), kind: 'pct' },
  { key: 'patientsPerHour', label: __('reports.patientsPerHour'), kind: 'num' },
  { key: 'scheduledHours', label: __('reports.scheduledHours'), kind: 'hours' }
]

const Row = ({ name, current, previous, strong, muted }) => (
  <tr style={{ ...(strong ? { fontWeight: 700, background: '#fafafa' } : {}), ...(muted ? { fontStyle: 'italic', color: '#666' } : {}) }}>
    <td style={{ verticalAlign: 'top' }}>{name}</td>
    {columns.map(col => (
      <td key={col.key} style={{ textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
        <Metric
          current={current ? current[col.key] : null}
          previous={previous ? previous[col.key] : null}
          kind={col.kind} />
      </td>
    ))}
  </tr>
)

export const AssigneeComparisonTable = ({ total, assignees = [] }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className='table table-condensed' style={{ fontSize: 13 }}>
      <thead>
        <tr>
          <th>{__('reports.assignee')}</th>
          {columns.map(col => <th key={col.key} style={{ textAlign: 'right' }}>{col.label}</th>)}
        </tr>
      </thead>
      <tbody>
        <Row
          name={__('reports.practiceTotal')}
          current={total && total.current}
          previous={total && total.previous}
          strong />
        {assignees.map(a => (
          <Row
            key={a.assigneeId || a.type}
            name={a.name}
            current={a.current}
            previous={a.previous}
            muted={a.type === 'einschub'} />
        ))}
      </tbody>
    </table>
  </div>
)
