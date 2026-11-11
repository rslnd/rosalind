import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'
import { PracticeTotals } from './PracticeTotals'
import { StatisticsTable } from './StatisticsTable'
import { LeadTimeSeriesChart } from './LeadTimeSeriesChart'

const avoidBreak = { pageBreakInside: 'avoid' }

const dayTitle = (date) => {
  const m = moment(date)
  return [m.format('dd'), m.format('D. MMM YYYY')].join(' • ')
}

// Retrospective report for the selected (past) day.
export const Statistics = ({ statistics }) => {
  if (!statistics) { return null }

  const { current = {}, assignees = [], leadTime } = statistics
  const hasData = current.total && current.total.total > 0

  const einschubRow = assignees.find(a => a.type === 'einschub')
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
        <PracticeTotals total={current.total} einschub={einschubCount} />
      </Box>

      {/* Pro Arzt */}
      <Box title={__('reports.assignee_plural')} icon='users' style={avoidBreak}>
        <StatisticsTable total={current.total} assignees={assignees} />
      </Box>

      {/* Vorlaufzeit Online vs. intern */}
      <Box title={__('reports.forecastLeadTitle')} icon='bar-chart' style={avoidBreak}>
        <p className='text-muted' style={{ marginTop: 0 }}>{__('reports.leadTimeHint')}</p>
        <LeadTimeSeriesChart distribution={leadTime} />
      </Box>
    </div>
  )
}
