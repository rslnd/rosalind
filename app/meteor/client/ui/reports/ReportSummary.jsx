import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
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

export const Unit = ({ prepend, append, children }) => (
  <span>
    {prepend && <small className="text-muted">{prepend}&nbsp;</small>}
    {children}
    {append && <small className="text-muted">&nbsp;{append}</small>}
  </span>
)

export const TotalRevenueBox = ({ report }) => (
  <InfoBox text={TAPi18n.__('reports.revenue')} color="green" icon="euro">
    <Unit prepend="€">{Math.floor(report.total.revenue)}</Unit>
  </InfoBox>
)

export const NewPatientsPerHourBox = ({ report }) => (
  <InfoBox
    text={TAPi18n.__('reports.patientsNewPerHour')} color="yellow" icon="user-plus">
    {
      report.total.patientsNewPerHourActual
      ? <Unit append="/h">{report.total.patientsNewPerHourActual.toFixed(1)}</Unit>
      : (report.total.patientsNewPerHourScheduled &&
        <Unit append="/h">{report.total.patientsNewPerHourScheduled.toFixed(1)}</Unit>
      )
    }
  </InfoBox>
)

export const TotalHoursBox = ({ report }) => (
  <InfoBox text={TAPi18n.__('reports.assigneeHours')} color="red" icon="calendar">
    {
      report.total.hoursActual
      ? <Unit append="h">{report.total.hoursActual.toFixed(1)}</Unit>
      : (
        report.total.hoursScheduled &&
          <Unit append="h">{report.total.hoursScheduled.toFixed(1)}</Unit>
      )
    }
  </InfoBox>
)

export const RevenuePerAssigneeBox = ({ report }) => (
  <InfoBox text={TAPi18n.__('reports.revenuePerAssignee')} color="aqua" icon="user-md">
    <Unit prepend="€">{Math.floor(report.total.revenuePerAssignee)}</Unit>
  </InfoBox>
)

export const TotalPatientsBox = ({ report }) => (
  <InfoBox text={TAPi18n.__('reports.patients')} color="purple" icon="users">
    {report.total.patients}
  </InfoBox>
)

export const NewPatientsPercentageBox = ({ report }) => (
  <InfoBox text={TAPi18n.__('reports.patientsNew')} color="teal" icon="plus">
    <Unit append="%">{Math.floor(report.total.patientsNew / report.total.patients * 100)}</Unit>
  </InfoBox>
)

export const ReportSummary = ({ report, showRevenue }) => {
  const withRevenue = [
    (<div key="TotalRevenueBox" className="col-md-3 col-sm-3 col-xs-12">
      <TotalRevenueBox report={report} />
    </div>),
    (<div key="NewPatientsPerHourBox" className="col-md-3 col-sm-3 col-xs-12">
      <NewPatientsPerHourBox report={report} />
    </div>),
    (<div key="TotalHoursBox" className="col-md-3 col-sm-3 col-xs-12">
      <TotalHoursBox report={report} />
    </div>),
    (<div key="RevenuePerAssigneeBox" className="col-md-3 col-sm-3 col-xs-12">
      <RevenuePerAssigneeBox report={report} />
    </div>)
  ]

  const withoutRevenue = [
    (<div key="TotalPatientsBox" className="col-md-3 col-sm-3 col-xs-12">
      <TotalPatientsBox report={report} />
    </div>),
    (<div key="NewPatientsPerHourBox" className="col-md-3 col-sm-3 col-xs-12">
      <NewPatientsPerHourBox report={report} />
    </div>),
    (<div key="TotalHoursBox" className="col-md-3 col-sm-3 col-xs-12">
      <TotalHoursBox report={report} />
    </div>),
    (<div key="NewPatientsPercentageBox" className="col-md-3 col-sm-3 col-xs-12">
      <NewPatientsPercentageBox report={report} />
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
