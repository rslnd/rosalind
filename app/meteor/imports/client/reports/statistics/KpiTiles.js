import React from 'react'
import { __ } from '../../../i18n'
import { Tile, TileRow } from './Tile'
import { fmtInt, fmtNum, fmtPct } from './format'

// Headline rates of the day (Ordination gesamt), to compare days with each other.
export const KpiTiles = ({ total, doctorCount }) => {
  const t = total || {}

  return (
    <TileRow>
      <Tile label={__('reports.assignee_plural')}>
        <b>{fmtInt(doctorCount)}</b>
      </Tile>
      {/* Same base as the "Termine" tile: kept appointments incl. Einschub vs. available slots */}
      <Tile label={__('reports.utilization')} hint={__('reports.utilizationHint')}>
        <b>{fmtPct(t.utilization)}</b>
      </Tile>
      <Tile label={__('reports.noShowRate')} hint={__('reports.noShowRateHint')}>
        <b>{fmtPct(t.noShowRate)}</b>
      </Tile>
      <Tile label={__('reports.patientsPerHour')} hint={__('reports.patientsPerHourHint')}>
        <b>{fmtNum(t.patientsPerHour)}</b>
      </Tile>
    </TileRow>
  )
}
