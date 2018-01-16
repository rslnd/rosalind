import React from 'react'
import { Box } from '../components/Box'
import { ReportTable } from './ReportTable'
import { ReportSummary } from './ReportSummary'
// import { Cancelations } from './Cancelations'
// import { TimelineBeforeAppointment } from './TimelineBeforeAppointment'
// import { SquaresContainer } from './Squares'

const style = {
  zoom: 0.909,
  pageBreakInside: 'avoid'
}

const absolutelyNoPadding = {
  paddingBottom: 0
}

export const Report = ({ report, showRevenue, mapUserIdToName, assigneeReport, mapReportAsToHeader, __ }) => (
  <div style={style}>
    <ReportSummary report={report} showRevenue={showRevenue} assigneeReport={assigneeReport} __={__} />
    <Box color={report.calendar.color} noPadding style={absolutelyNoPadding}>
      <ReportTable report={report} showRevenue={showRevenue} mapUserIdToName={mapUserIdToName} assigneeReport={assigneeReport} mapReportAsToHeader={mapReportAsToHeader} __={__} />
    </Box>

    {/* <div className="row">
      <div className="col-md-4">
        <Box title="Absagen" noPadding icon="calendar-times-o">
          <Cancelations report={report} />
        </Box>
      </div>
      <div className="col-md-8">
        <TimelineBeforeAppointment report={report} />
      </div>
    </div> */}

    {/* <div className="row">
      <div className="col-md-9">
        <SquaresContainer report={report} />
      </div>
    </div> */}
  </div>
)
