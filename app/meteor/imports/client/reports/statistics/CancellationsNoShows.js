import React from 'react'
import { __ } from '../../../i18n'
import { fmtInt, Metric } from './format'
import { Tile, TileRow } from './Tile'
import { NEUTRAL, RED, TEXT_COLOR } from './flowPalette'
import { GroupedBarChart } from './GroupedBarChart'

const MONTHS_DE = ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const monthShort = key => MONTHS_DE[Number(key.split('-')[1]) - 1]

// Paler colors for the Vorjahr chart.
const NEUTRAL_PALE = '#c7cfd8'
const RED_PALE = '#e3a99f'

const subHeading = { fontSize: 12, fontWeight: 700, color: '#555', margin: '10px 0 4px' }

const Legend = ({ color, label }) => (
  <span style={{ marginRight: 14, whiteSpace: 'nowrap', fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
    <span style={{ display: 'inline-block', width: 12, height: 12, background: color, borderRadius: 2, marginRight: 5 }} />
    <span style={{ color: TEXT_COLOR }}>{label}</span>
  </span>
)

const trendChart = (data, pale) => {
  const categories = data.map(m => ({ key: m.month, label: monthShort(m.month) }))
  const series = [
    { id: 'canceled', label: __('reports.canceled'), color: pale ? NEUTRAL_PALE : NEUTRAL, values: data.map(m => m.canceled) },
    { id: 'noShow', label: __('reports.noShow'), color: pale ? RED_PALE : RED, values: data.map(m => m.noShow) }
  ]
  return (
    <GroupedBarChart categories={categories} series={series} yFormat={fmtInt} height={210}
      ariaLabel={__('reports.cancelNoShowTitle')} />
  )
}

const cohortHeading = { fontSize: 13, fontWeight: 700, color: '#333', margin: '0 0 8px' }

// One cohort's cancellations & no-shows: headline counts/rates + a monthly
// trend. No-shows are computed server-side (admittedAt/canceled), not a DB flag.
const CohortCancel = ({ cohort, compare, showHeading }) => {
  const current = cohort.current
  if (!current) { return null }
  const previous = compare ? cohort.previous : null
  const months = current.months || []
  const hasCompare = !!(previous && previous.months && previous.months.length)
  const curLabel = cohort.label
  const prevLabel = hasCompare ? __('reports.cohortVorjahrSuffix', { label: cohort.label }) : null

  return (
    <div style={{ marginBottom: 26 }}>
      {showHeading && <div style={cohortHeading}>{cohort.label}</div>}
      <TileRow>
        <Tile label={__('reports.canceled')}><Metric current={current.canceled} previous={previous && previous.canceled} kind='int' strong /></Tile>
        <Tile label={__('reports.cancelRate')}><Metric current={current.canceledRate} previous={previous && previous.canceledRate} kind='pct' strong /></Tile>
        <Tile label={__('reports.noShow')}><Metric current={current.noShow} previous={previous && previous.noShow} kind='int' strong /></Tile>
        <Tile label={__('reports.noShowRate')} hint={__('reports.noShowRateHint')}><Metric current={current.noShowRate} previous={previous && previous.noShowRate} kind='pct' strong /></Tile>
      </TileRow>

      {months.length > 0 &&
        <div>
          <div style={{ marginBottom: 6 }}>
            <Legend color={NEUTRAL} label={__('reports.canceled')} />
            <Legend color={RED} label={__('reports.noShow')} />
          </div>

          {hasCompare &&
            <div>
              {prevLabel && <div style={subHeading}>{prevLabel}</div>}
              {trendChart(previous.months, true)}
            </div>}

          {hasCompare && curLabel &&
            <div style={subHeading}>{curLabel}</div>}
          {trendChart(months, false)}
        </div>}
    </div>
  )
}

// Cancellations & no-shows, one block per cohort.
export const CancellationsNoShows = ({ cohorts = [], compare = false }) => {
  if (!cohorts.length) { return null }
  const showHeading = cohorts.length > 1
  return (
    <div>
      {cohorts.map(c => <CohortCancel key={c.id} cohort={c} compare={compare} showHeading={showHeading} />)}
    </div>
  )
}
