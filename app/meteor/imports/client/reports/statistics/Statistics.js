import React from 'react'
import { __ } from '../../../i18n'
import { Box } from '../../components/Box'
import { TodayBlock } from './TodayBlock'
import { KpiTiles } from './KpiTiles'
import { BillingBlock } from './BillingBlock'
import { StatisticsTable } from './StatisticsTable'
import { AssigneeBars } from './AssigneeBars'
import { AssigneeComparisonTable } from './AssigneeComparisonTable'
import { LeadTimeChart } from './LeadTimeChart'

const avoidBreak = { pageBreakInside: 'avoid' }

export const Statistics = ({ statistics }) => {
  if (!statistics) { return null }

  const { today, current = {}, previous = {}, assignees = [], leadTime = {} } = statistics
  const hasData = current.total && current.total.total > 0

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

      {/* Ordination gesamt (30 Tage, Vorjahresvergleich) */}
      <Box title={__('reports.practiceTotal') + ' · ' + __('reports.windowLabel', { days: statistics.windowDays })} icon='hospital-o'>
        <KpiTiles current={current.total} previous={previous.total} />
      </Box>

      {/* Kasse / Privat (gesamt) */}
      <BillingBlock total={current.total} />

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
