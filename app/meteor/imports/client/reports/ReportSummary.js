import React from 'react'
import idx from 'idx'
import { Icon } from '../components/Icon'
import { currency, integer, float, percentage, conditionalFloat } from '../../util/format'

const Nil = () => (
  <span className='text-quite-muted'>?</span>
)

const BigPercent = (props) => {
  return <Unit append='%'>{percentage({ ...props, plain: true })}</Unit>
}

export const InfoBox = ({ color = 'green', icon = 'eur', children, text, description, __ }) => (
  <div className='info-box'>
    <span className={`info-box-icon bg-${color}`}>
      <Icon name={icon} />
    </span>
    <div className='info-box-content enable-select'>
      <span className='info-box-number'>{children}</span>
      <span className='info-box-text'>{text}</span>
      <span className='info-box-description text-muted'>{description}</span>
    </div>
  </div>
)

export const Unit = ({ prepend, append, children, __ }) => (
  <span>
    {prepend && <small className='text-muted'>{prepend}&nbsp;</small>}
    {
      (typeof children === 'number' ||
      typeof children === 'string')
      ? children
      : <span className='text-muted'>?</span>
    }
    {append && <small className='text-muted'>&nbsp;{append}</small>}
  </span>
)

export const TotalRevenueBox = ({ report, __ }) => (
  <InfoBox text={__('reports.revenue')} color='green' icon='euro'>
    {
      idx(report, _ => _.total.revenue.actual)
      ? <Unit prepend='€'>{integer(report.total.revenue.actual)}</Unit>
      : <Nil />
    }
  </InfoBox>
)

export const NewPatientsPerHourBox = ({ report, __ }) => {
  const newPerHour = idx(report, _ => _.average.patients.new.actualPerHour) ||
    idx(report, _ => _.average.patients.new.plannedPerHour)

  return (
    <InfoBox
      text={__('reports.patientsNewPerHour')} color='purple' icon='user-plus'>
      {
        newPerHour
        ? <Unit append='/h'>{float(newPerHour)}</Unit>
        : <Nil />
      }
    </InfoBox>
  )
}

export const Workload = ({ report, __ }) => {
  const workload = idx(report, _ => _.total.workload.actual) ||
    idx(report, _ => _.total.workload.planned)

  return (
    <InfoBox text='Termine' color='aqua' icon='calendar'>
      {
        workload
        ? <BigPercent part={workload} of={report.total.workload.available} />
        : <Nil />
      }
    </InfoBox>
  )
}

export const NoShowsBox = ({ report, __ }) => {
  const expected = idx(report, _ => _.total.patients.total.expected)
  const noShows = idx(report, _ => _.total.patients.total.noShow)

  return (
    <InfoBox text='Nicht erschienen' color='red' icon='user-o'>
      {
        noShows
        ? <BigPercent part={noShows} of={expected} />
        : <Nil />
      }
    </InfoBox>
  )
}

export const TotalPatientsBox = ({ report, __ }) => {
  const patients = idx(report, _ => _.total.patients.total.actual) ||
    idx(report, _ => _.total.patients.total.planned)

  return (
    <InfoBox text={__('reports.patients')} color='green' icon='users'>
      {patients || <Nil />}
    </InfoBox>
  )
}

export const ReportSummary = ({ report, showRevenue, __ }) => {
  const withRevenue = [
    (<div key='TotalRevenueBox' className='col-md-3 col-sm-3 col-xs-12'>
      <TotalRevenueBox report={report} __={__} />
    </div>),
    (<div key='WorkloadBox' className='col-md-3 col-sm-3 col-xs-12'>
      <Workload report={report} __={__} />
    </div>),
    (<div key='NoShowsBox' className='col-md-3 col-sm-3 col-xs-12'>
      <NoShowsBox report={report} __={__} />
    </div>),
    (<div key='NewPatientsPerHourBox' className='col-md-3 col-sm-3 col-xs-12'>
      <NewPatientsPerHourBox report={report} __={__} />
    </div>)
  ]

  const withoutRevenue = [
    (<div key='TotalPatientsBox' className='col-md-3 col-sm-3 col-xs-12'>
      <TotalPatientsBox report={report} __={__} />
    </div>),
    (<div key='WorkloadBox' className='col-md-3 col-sm-3 col-xs-12'>
      <Workload report={report} __={__} />
    </div>),
    (<div key='NoShowsBox' className='col-md-3 col-sm-3 col-xs-12'>
      <NoShowsBox report={report} __={__} />
    </div>),
    (<div key='NewPatientsPerHourBox' className='col-md-3 col-sm-3 col-xs-12'>
      <NewPatientsPerHourBox report={report} __={__} />
    </div>)
  ]

  return (
    <div className='row'>
      {
        showRevenue
        ? withRevenue
        : withoutRevenue
      }
    </div>
  )
}
