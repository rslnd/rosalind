import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'
import { KpiTiles } from './KpiTiles'
import { PracticeTotals } from './PracticeTotals'
import { StatisticsTable } from './StatisticsTable'
import { LeadTimeSeriesChart } from './LeadTimeSeriesChart'
import { BRAND } from './flowPalette'

// On the whole box (boxStyle), so a title never ends up alone at the bottom of a printed page
const avoidBreak = { pageBreakInside: 'avoid', breakInside: 'avoid' }

const badgeStyle = {
  display: 'inline-block',
  verticalAlign: 'middle',
  marginLeft: 8,
  marginTop: -3,
  minWidth: 20,
  padding: '2px 7px',
  borderRadius: 10,
  backgroundColor: BRAND,
  color: '#fff',
  fontSize: 12,
  fontWeight: 700,
  lineHeight: '16px',
  textAlign: 'center'
}

const dayTitle = (date) => {
  const m = moment(date)
  return [__('reports.statisticsTitle'), m.format('dd'), m.format('D. MMM YYYY')].join(' • ')
}

// Retrospective report for the selected (past) day.
export const Statistics = ({ statistics }) => {
  if (!statistics) { return null }

  const { current = {}, assignees = [], leadTime } = statistics
  const hasData = current.total && current.total.total > 0

  const einschubRow = assignees.find(a => a.type === 'einschub')
  const doctorCount = assignees.filter(a => a.type !== 'einschub').length
  const einschubCount = einschubRow && einschubRow.current ? einschubRow.current.total : 0

  if (!hasData) {
    return (
      <Box type='warning' title={__('ui.notice')}>
        <p>{__('reports.statisticsEmpty')}</p>
      </Box>
    )
  }

  return (
    <div>
      {/* Ordination gesamt — absolute Zahlen + Anteile */}
      <Box icon='calendar' title={dayTitle(current.from)}>
        <KpiTiles total={current.total} doctorCount={doctorCount} />
        <PracticeTotals total={current.total} einschub={einschubCount} />
      </Box>

      {/* Pro Arzt */}
      <Box
        title={<span>{__('reports.assignee_plural')}<span style={badgeStyle}>{doctorCount}</span></span>}
        icon='users'
        boxStyle={avoidBreak}>
        <StatisticsTable total={current.total} assignees={assignees} />
      </Box>

      {/* Vorlaufzeit Online vs. intern */}
      <Box title={__('reports.forecastLeadTitle')} icon='bar-chart' boxStyle={avoidBreak}>
        <p className='text-muted' style={{ marginTop: 0 }}>{__('reports.leadTimeHint')}</p>
        <LeadTimeSeriesChart distribution={leadTime} />
      </Box>
    </div>
  )
}
