import React from 'react'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'
import { fmtInt, fmtPct } from './format'

const cols = [
  { key: 'total', label: __('reports.appointmentsTotal'), fmt: fmtInt },
  { key: 'admitted', label: __('reports.kept'), fmt: fmtInt },
  { key: 'noShow', label: __('reports.noShow'), fmt: fmtInt },
  { key: 'noShowRate', label: __('reports.noShowShort'), fmt: fmtPct }
]

const Row = ({ label, metrics }) => (
  <tr>
    <td style={{ fontWeight: 700 }}>{label}</td>
    {cols.map(c => (
      <td key={c.key} style={{ textAlign: 'right' }}>{metrics ? c.fmt(metrics[c.key]) : '–'}</td>
    ))}
  </tr>
)

// Kasse vs. Privat split for the whole practice (no year comparison).
export const BillingBlock = ({ total }) => {
  const billing = total && total.billing
  if (!billing) { return null }

  return (
    <Box title={__('reports.insurance') + ' / ' + __('reports.privateShort') + ' (' + __('reports.practiceTotal') + ')'} icon='pie-chart'>
      <table className='table table-condensed' style={{ fontSize: 13, marginBottom: 0 }}>
        <thead>
          <tr>
            <th />
            {cols.map(c => <th key={c.key} style={{ textAlign: 'right' }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          <Row label={__('reports.insurance')} metrics={billing.insurance} />
          <Row label={__('reports.privateShort')} metrics={billing.private} />
        </tbody>
      </table>
    </Box>
  )
}
