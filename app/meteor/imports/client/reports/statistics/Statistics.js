import React from 'react'
import moment from 'moment-timezone'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'
import { TodayBlock } from './TodayBlock'
import { PracticeTotals } from './PracticeTotals'
import { StatisticsTable } from './StatisticsTable'
import { AssigneeBars } from './AssigneeBars'
import { AssigneeComparisonTable } from './AssigneeComparisonTable'
import { LeadTimeChart } from './LeadTimeChart'

const avoidBreak = { pageBreakInside: 'avoid' }

export const Statistics = ({ statistics }) => {
  if (!statistics) { return null }

  const { today, current = {}, previous = {}, assignees = [], leadTime = {} } = statistics
  const hasData = current.total && current.total.total > 0

  const einschubRow = assignees.find(a => a.type === 'einschub')
  const einschubCount = einschubRow && einschubRow.current ? einschubRow.current.total : 0
  const rangeLabel = current.from && current.to
    ? __('reports.windowRange', {
      from: moment(current.from).format('D. MMM'),
      to: moment(current.to).format('D. MMM YYYY')
    })
    : ''

  if (!hasData) {
    return (
      <Box type='warning' title={__('ui.notice')}>
        <p>{__('reports.statisticsEmpty')}</p>
      </Box>
    )
  }

  return (
    <div>
      {/* Heute */}
      <TodayBlock
        today={today}
        monthAdmitted={current.total.admitted}
        monthNoShow={current.total.noShow}
        monthNoShowRate={current.total.noShowRate} />

      {/* Ordination gesamt (30 Tage) — absolute Zahlen + Anteile */}
      <Box
        icon='hospital-o'
        title={
          <span>
            {__('reports.windowReportTitle', { days: statistics.windowDays })}
            {rangeLabel && <small className='text-muted' style={{ fontWeight: 400 }}>&ensp;{rangeLabel}</small>}
          </span>
        }>
        <PracticeTotals total={current.total} einschub={einschubCount} />
      </Box>

      {/* Pro Arzt – aktuelle Werte + Balken */}
      <Box title={__('reports.assignee_plural') + ' · ' + __('reports.windowLabel', { days: statistics.windowDays })} icon='users' style={avoidBreak}>
        <StatisticsTable total={current.total} assignees={assignees} />
        <AssigneeBars assignees={assignees} />
      </Box>

      {/* Pro Arzt – Vorjahresvergleich (separate Tabelle) */}
      <Box title={__('reports.assignee_plural') + ' · ' + __('reports.previousYear')} icon='exchange' style={avoidBreak}>
        <AssigneeComparisonTable
          total={{ current: current.total, previous: previous.total }}
          assignees={assignees} />
      </Box>

      {/* Vorlaufzeit-Verteilung */}
      <Box title={__('reports.leadTimeTitle')} icon='bar-chart' style={avoidBreak}>
        <p className='text-muted' style={{ marginTop: 0 }}>{__('reports.leadTimeHint')}</p>
        <LeadTimeChart distribution={leadTime.total} />
      </Box>
    </div>
  )
}
