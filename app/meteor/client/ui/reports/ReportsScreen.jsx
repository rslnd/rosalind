import React from 'react'
import { DateNavigation } from 'client/ui/components/DateNavigation'

export const ReportsScreen = ({ date, report }) => (
  <div className="content">
    <DateNavigation date={date} basePath="reports" />
    <pre>{JSON.stringify(report)}</pre>
  </div>
)
