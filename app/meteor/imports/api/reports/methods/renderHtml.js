import React from 'react'
import ReactDOMServer from 'react-dom/server'

export const renderHtml = ({ report }) => {
  const Report = () =>
    <div>
      <h1>This is a Report</h1>
    </div>

  const html = ReactDOMServer.renderToStaticMarkup(<Report />)

  return html
}
