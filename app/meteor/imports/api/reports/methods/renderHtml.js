import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { Report } from '../../../ui/reports/Report'

export const renderHtml = ({ report, __, mapUserIdToName }) => {
  const ReportContainer = () =>
    <div>
      <Report report={report} mapUserIdToName={mapUserIdToName} __={__} />
    </div>

  const html = ReactDOMServer.renderToStaticMarkup(<ReportContainer />)

  return html
}
