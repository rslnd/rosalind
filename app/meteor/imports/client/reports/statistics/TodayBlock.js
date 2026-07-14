import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'
import { Tile, TileRow } from './Tile'
import { fmtInt, fmtPct } from './format'

// "Heute"-Block: numbers for the selected day, plus the 30-day kept / not-kept
// totals for context.
export const TodayBlock = ({ today, monthAdmitted, monthNoShow, monthNoShowRate }) => {
  if (!today || !today.total) { return null }
  const t = today.total
  const dateLabel = today.date ? moment(today.date).format('dddd, D. MMMM YYYY') : ''

  return (
    <Box title={`${__('reports.today')} – ${dateLabel}`} icon='calendar'>
      <TileRow style={{ marginBottom: 0 }}>
        <Tile label={__('reports.appointmentsTotal')}>{fmtInt(t.total)}</Tile>
        <Tile label={__('reports.kept')} hint={__('reports.keptHint')}>
          <span style={{ fontWeight: 700 }}>{fmtInt(t.admitted)}</span>
        </Tile>
        <Tile label={__('reports.noShow')}>{fmtInt(t.noShow)} <small className='text-muted'>/ {fmtPct(t.noShowRate)}</small></Tile>
        <Tile label={__('reports.insurance')}>{fmtInt(t.insurance)}</Tile>
        <Tile label={__('reports.privateShort')}>{fmtInt(t.private)}</Tile>
        <Tile label={__('reports.keptMonth')} hint={__('reports.keptMonthHint')}>
          {fmtInt(monthAdmitted)}
        </Tile>
        <Tile label={__('reports.notKeptMonth')} hint={__('reports.notKeptMonthHint')}>
          {fmtInt(monthNoShow)} <small className='text-muted'>/ {fmtPct(monthNoShowRate)}</small>
        </Tile>
      </TileRow>
    </Box>
  )
}
