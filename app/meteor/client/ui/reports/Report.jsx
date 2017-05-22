import React from 'react'
import { Box } from 'client/ui/components/Box'
import { ReportTable } from './ReportTable'
import { ReportSummary } from './ReportSummary'
import { Cancelations } from './Cancelations'
import { TimelineBeforeAppointment } from './TimelineBeforeAppointment'
import { SquaresContainer } from './Squares'
import { Week } from './Week'

const style = {
  zoom: .909
}

export const Report = ({ report, showRevenue }) => (
  <div style={style}>
    <ReportSummary report={report} showRevenue={showRevenue} />
    <Box type="info" noPadding>
      <ReportTable report={report} showRevenue={showRevenue} />
    </Box>

    {/*<div className="row">
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
    </div>*/}
  </div>
)
