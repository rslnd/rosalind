import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'

const Nil = () => (
  <span className="text-quite-muted">?</span>
)

export const InfoBox = ({ color = 'green', icon = 'eur', children, text, description }) => (
  <div className="info-box">
    <span className={`info-box-icon bg-${color}`}>
      <Icon name={icon} />
    </span>
    <div className="info-box-content">
      <span className="info-box-number">{children}</span>
      <span className="info-box-text">{text}</span>
      <span className="info-box-description text-muted">{description}</span>
    </div>
  </div>
)

export const Unit = ({ prepend, append, children }) => (
  <span>
    {prepend && <small className="text-muted">{prepend}&nbsp;</small>}
    {
      (typeof children === 'number' ||
      typeof children === 'string')
      ? children
      : <span className="text-muted">?</span>
    }
    {append && <small className="text-muted">&nbsp;{append}</small>}
  </span>
)

export const TotalRevenueBox = ({ report }) => (
  <InfoBox text={TAPi18n.__('reports.revenue')} color="green" icon="euro">
    <Unit prepend="€">7.250</Unit>
  </InfoBox>
)

export const NewPatientsPerHourBox = ({ report }) => (
  <InfoBox
    text={TAPi18n.__('reports.patientsNewPerHour')} color="purple" icon="user-plus">
    {
      report.total.patientsNewPerHourActual
      ? <Unit append="/h">{report.total.patientsNewPerHourActual.toFixed(1)}</Unit>
      : (report.total.patientsNewPerHourScheduled
        ? <Unit append="/h">{report.total.patientsNewPerHourScheduled.toFixed(1)}</Unit>
        : <Nil />
      )
    }
  </InfoBox>
)

export const Workload = ({ report }) => (
  <InfoBox text="Auslastung" color="aqua" icon="calendar">
    <Unit append="%">97.2</Unit>
  </InfoBox>
)

export const NoShowsBox = ({ report }) => (
  <InfoBox text="Nicht erschienen" color="red" icon="user-o">
    <Unit append="%">2.4</Unit>
  </InfoBox>
)

export const TotalPatientsBox = ({ report }) => (
  <InfoBox text={TAPi18n.__('reports.patients')} color="green" icon="users">
    {report.total.patients}
  </InfoBox>
)

export const ReportSummary = ({ report, showRevenue }) => {
  const withRevenue = [
    (<div key="TotalRevenueBox" className="col-md-3 col-sm-3 col-xs-12">
      <TotalRevenueBox report={report} />
    </div>),
    (<div key="WorkloadBox" className="col-md-3 col-sm-3 col-xs-12">
      <Workload report={report} />
    </div>),
    (<div key="NoShowsBox" className="col-md-3 col-sm-3 col-xs-12">
      <NoShowsBox report={report} />
    </div>),
    (<div key="NewPatientsPerHourBox" className="col-md-3 col-sm-3 col-xs-12">
      <NewPatientsPerHourBox report={report} />
    </div>)
  ]

  const withoutRevenue = [
    (<div key="TotalPatientsBox" className="col-md-3 col-sm-3 col-xs-12">
      <TotalPatientsBox report={report} />
    </div>),
    (<div key="WorkloadBox" className="col-md-3 col-sm-3 col-xs-12">
      <Workload report={report} />
    </div>),
    (<div key="NoShowsBox" className="col-md-3 col-sm-3 col-xs-12">
      <NoShowsBox report={report} />
    </div>),
    (<div key="NewPatientsPerHourBox" className="col-md-3 col-sm-3 col-xs-12">
      <NewPatientsPerHourBox report={report} />
    </div>)
  ]

  return (
    <div className="row">
      {
        showRevenue
        ? withRevenue
        : withoutRevenue
      }
    </div>
  )
}
