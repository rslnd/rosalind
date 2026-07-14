import React from 'react'
import { __ } from '../../../i18n'
import { Metric } from './format'
import { Tile, TileRow } from './Tile'

// Headline tiles for the whole practice (Ordination gesamt), 30 days vs. previous year.
export const KpiTiles = ({ current, previous }) => {
  const cur = current || {}
  const prev = previous || {}

  const T = ({ label, hint, kind, field }) => (
    <Tile label={label} hint={hint}>
      <Metric current={cur[field]} previous={prev[field]} kind={kind} strong />
    </Tile>
  )

  return (
    <TileRow>
      <T label={__('reports.utilizationTime')} hint={__('reports.utilizationTimeHint')} kind='pct' field='timeUtilization' />
      <T label={__('reports.utilizationSlots')} hint={__('reports.utilizationSlotsHint')} kind='pct' field='slotUtilization' />
      <T label={__('reports.appointmentsTotal')} kind='int' field='total' />
      <T label={__('reports.kept')} hint={__('reports.keptHint')} kind='int' field='admitted' />
      <T label={__('reports.noShow')} kind='pct' field='noShowRate' />
      <T label={__('reports.insurance')} kind='int' field='insurance' />
      <T label={__('reports.privateShort')} kind='int' field='private' />
      <T label={__('reports.onlineBooked')} kind='int' field='online' />
      <T label={__('reports.onlineNoShow')} kind='pct' field='onlineNoShowRate' />
    </TileRow>
  )
}
