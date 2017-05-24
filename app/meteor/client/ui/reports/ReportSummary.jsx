import React from 'react'
import { TAPi18n } from 'meteor/tap:i18n'
import { Icon } from 'client/ui/components/Icon'
import { formatPercentage } from './shared/Percent'

const Nil = () => (
  <span className="text-quite-muted">?</span>
)

const BigPercent = (props) => {
  const percentage = Math.round(100 * props.part / props.of)
  return <Unit append="%">{percentage}</Unit>
}

export const InfoBox = ({ color = 'green', icon = 'eur', children, text, description }) => (
  <div className="info-box">
    <span className={`info-box-icon bg-${color}`}>
      <Icon name={icon} />
    </span>
    <div className="info-box-content enable-select">
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
    {
      idx(report, _ => _.total.revenue.actual)
      ? <Unit prepend="€">{Math.round(report.total.revenue.actual)}</Unit>
      : <Nil /> 
    }
  </InfoBox>
)

export const NewPatientsPerHourBox = ({ report }) => {
  const newPerHour = idx(report, _ => _.average.patients.new.actualPerHour) || 
    idx(report, _ => _.average.patients.new.plannedPerHour)

  return (
    <InfoBox
      text={TAPi18n.__('reports.patientsNewPerHour')} color="purple" icon="user-plus">
      {
        newPerHour
        ? <Unit append="/h">{newPerHour.toFixed(1)}</Unit>
        : <Nil />
      }
    </InfoBox>
  )
}

export const Workload = ({ report }) => {
  const workload = idx(report, _ => _.total.workload.actual) || 
    idx(report, _ => _.total.workload.planned)

  return (
    <InfoBox text="Termine" color="aqua" icon="calendar">
      {
        workload
        ? <BigPercent part={workload} of={report.total.workload.available} />
        : <Nil />
      }
    </InfoBox>
  )
}

export const NoShowsBox = ({ report }) => {
  const noShows = idx(report, _ => _.total.noShows.noShows)
  const percentage = formatPercentage({
    part: noShows,
    of: report.total.patients.total.planned
  })

  return (
    <InfoBox text="Nicht erschienen" color="red" icon="user-o">
      {noShows && <Unit append="%">{percentage}</Unit> || <Nil />}
    </InfoBox>
  )
}

export const TotalPatientsBox = ({ report }) => {
  const patients = idx(report, _ => _.total.patients.total.actual) ||
    idx(report, _ => _.total.patients.total.planned )

  return (
    <InfoBox text={TAPi18n.__('reports.patients')} color="green" icon="users">
      {patients || <Nil />}
    </InfoBox>
  )
}

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
