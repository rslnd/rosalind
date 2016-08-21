import React from 'react'
import { Icon } from 'client/ui/components/Icon'

export const InfoBox = ({ color = 'green', icon = 'eur', children, text, description }) => (
  <div className="info-box">
    <span className={`info-box-icon bg-${color}`}>
      <Icon name={icon} />
    </span>
    <div className="info-box-content">
      <span className="info-box-number">{children}</span>
      <span className="info-box-text">{text}</span>
      <span className="info-box-description">{description}</span>
    </div>
  </div>
)

export const ReportSummary = ({ report, showRevenue }) => (
  <div className="row">
  </div>
)
