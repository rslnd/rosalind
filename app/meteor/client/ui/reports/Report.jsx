import React from 'react'
import { ReportTable } from './ReportTable'
import { ReportSummary } from './ReportSummary'

export const Report = ({ report, showRevenue }) => (
  <div>
    <ReportSummary report={report} showRevenue={showRevenue} />
    <div className="box box-info">
      <div className="box-body no-padding">
        <ReportTable report={report} showRevenue={showRevenue} />
      </div>
    </div>
  </div>
)
