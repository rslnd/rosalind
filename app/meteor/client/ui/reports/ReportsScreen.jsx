import React from 'react'
import FlipMove from 'react-flip-move'
import { TAPi18n } from 'meteor/tap:i18n'
import { weekOfYear } from 'util/time/format'
import { DateNavigation } from 'client/ui/components/DateNavigation'
import { Box } from 'client/ui/components/Box'
import { Report } from './Report'

export const ReportsScreen = ({ date, report }) => (
  <div>
    <div className="content-header">
      <h1>
        {TAPi18n.__('reports.thisDaySingular')} {date.calendar()}
        <small>{weekOfYear(date)}</small>
      </h1>
      <DateNavigation date={date} basePath="reports" pullRight />
    </div>
    <div className="content">
      <FlipMove duration={230}>
        {
          report
          ? <div key="reportTable"><Report report={report} /></div>
        : <div key="noReports"><Box type="warning" title={TAPi18n.__('ui.notice')} body={TAPi18n.__('reports.empty')} /></div>
        }
      </FlipMove>
    </div>
  </div>
)
