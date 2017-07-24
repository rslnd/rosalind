import React from 'react'
import { Box } from '../components/Box'
import { ReportTable } from './ReportTable'
import { ReportSummary } from './ReportSummary'
// import { Cancelations } from './Cancelations'
// import { TimelineBeforeAppointment } from './TimelineBeforeAppointment'
// import { SquaresContainer } from './Squares'
// import { Week } from './Week'

const style = {
  zoom: 0.909
}

export const Report = ({ report, showRevenue, mapUserIdToName, __ }) => (
  <div style={style}>
    <ReportSummary report={report} showRevenue={showRevenue} __={__} />
    <Box type='info' noPadding>
      <ReportTable report={report} showRevenue={showRevenue} mapUserIdToName={mapUserIdToName} __={__} />
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
    </div>

    <div className="row">
      <div className="col-md-12">
        <Box title="Auslastung und Dienstplan" icon="users">
          <Week report={report} />
        </Box>
      </div>
    </div>

    <div className="row">
      <div className="col-md-9">
        <SquaresContainer report={report} />
      </div>
    </div> */}
  </div>
)
