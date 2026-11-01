import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'
import { Tile, TileRow } from './Tile'
import { fmtInt, fmtPct } from './format'

// "Heute"-Block: numbers for the selected day.
export const TodayBlock = ({ today }) => {
  if (!today || !today.total) { return null }
  const t = today.total
  const weekday = today.date ? moment(today.date).format('dd') : ''
  const dateLabel = today.date ? moment(today.date).format('D. MMM YYYY') : ''
  // "Heute" only when the report's day really is today; past days just show the date.
  const isToday = today.date ? moment(today.date).isSame(moment(), 'day') : false
  // Wider gaps around the separator (en spaces) so the bullet breathes.
  const title = [isToday && __('reports.today'), weekday, dateLabel].filter(Boolean).join(' • ')

  return (
    <Box title={title} icon='calendar'>
      <TileRow style={{ marginBottom: 0 }}>
        <Tile label={__('reports.appointmentsTotal')}>{fmtInt(t.total)}</Tile>
        <Tile label={__('reports.kept')} hint={__('reports.keptHint')}>
          <span style={{ fontWeight: 700 }}>{fmtInt(t.admitted)}</span>
        </Tile>
        <Tile label={__('reports.noShow')}>{fmtInt(t.noShow)} <small className='text-muted'>/ {fmtPct(t.noShowRate)}</small></Tile>
        <Tile label={__('reports.insurance')}>{fmtInt(t.insurance)}</Tile>
        <Tile label={__('reports.privateShort')}>{fmtInt(t.private)}</Tile>
      </TileRow>
    </Box>
  )
}
