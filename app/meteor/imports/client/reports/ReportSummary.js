import React from 'react'
import idx from 'idx'
import { __ } from '../../i18n'
import { Icon } from '../components/Icon'
import { currency, integer, float, percentage, conditionalFloat } from '../../util/format'
import { Nil } from './shared/Nil'
import { lighten } from '../layout/styles'

const BigPercent = (props) => {
  const value = percentage({ ...props, plain: true })
  return <Unit append='%'>{
    (!Number.isNaN(value) && value !== null)
      ? value
      : <Nil />
  }</Unit>
}

export const InfoBox = ({ color, position, icon = 'eur', children, text, description }) => (
  <div className='info-box'>
    <span className={`info-box-icon`} style={{
      color: '#fff',
      backgroundColor: lighten(color, -7 * (5 - position)) }}>
      <span style={{ opacity: 0.95 }}>
        <Icon name={icon} />
      </span>
    </span>
    <div className='info-box-content enable-select'>
      <span className='info-box-number'>{children}</span>
      <span className='info-box-text'>{text}</span>
      {description && <span className='info-box-description text-muted'>{description}</span>}
    </div>
  </div>
)

export const Unit = ({ prepend, append, children }) => (
  <span>
    {prepend && <small className='text-muted'>{prepend}&nbsp;</small>}
    {
      (typeof children === 'number' ||
      typeof children === 'string' &&
      !Number.isNaN(children))
        ? children
        : <Nil />
    }
    {append && <small className='text-muted'>&nbsp;{append}</small>}
  </span>
)

export const TotalRevenueBox = ({ report, position, color }) => {
  const revenue = (
    idx(report, _ => _.total.revenue.actual) || // backwards compatibility
    idx(report, _ => _.total.revenue.total.actual) ||
    idx(report, _ => _.total.revenue.total.expected)
  )

  return <InfoBox text={__('reports.revenue')} color={color} position={position} icon='euro'>
    {
      !Number.isNaN(revenue)
        ? <Unit prepend='€'>{integer(revenue)}</Unit>
        : <Nil />
    }
  </InfoBox>
}

export const NewPatientsPerHourBox = ({ report, position, color }) => {
  const newPerHour = idx(report, _ => _.average.patients.new.actualPerHour) ||
    idx(report, _ => _.average.patients.new.expectedPerHour)

  return (
    <InfoBox
      text={__('reports.patientsNewPerHour')} color={color} position={position} icon='user-plus'>
      {
        !Number.isNaN(newPerHour)
          ? <Unit append='/h'>{float(newPerHour)}</Unit>
          : <Nil />
      }
    </InfoBox>
  )
}

export const KeyMetricBox = ({ report, position, color }) => {
  if (report.calendar.privateAppointments) {
    return <TotalPatientsBox report={report} position={position} color={color} />
  } else {
    return <NewPatientsPerHourBox report={report} position={position} color={color} />
  }
}

export const Workload = ({ report, position, color }) => {
  const workload = report.total.workload.weighted

  return (
    <InfoBox text='Auslastung' color={color} position={position} icon='bars'>
      {
        workload
          ? <BigPercent value={workload} />
          : <BigPercent
            part={idx(report, _ => _.total.patients.total.admitted)}
            of={idx(report, _ => _.total.patients.total.expected)} />
      }
    </InfoBox>
  )
}

export const NoShowsBox = ({ report, position, color }) => {
  const expected = idx(report, _ => _.total.patients.total.expected)
  const noShows = idx(report, _ => _.total.patients.total.noShow) || 0

  return (
    <InfoBox text='Nicht erschienen' color={color} position={position} icon='user-o'>
      <BigPercent part={noShows} of={expected} />
    </InfoBox>
  )
}

export const TotalPatientsBox = ({ report, position, color }) => {
  const patients = idx(report, _ => _.total.patients.total.actual) ||
    idx(report, _ => _.total.patients.total.expected) || 0

  return (
    <InfoBox text={__('reports.patients')} color={color} position={position} icon='users'>
      {
        integer(patients)
      }
    </InfoBox>
  )
}

export const ReportSummary = ({ report, showRevenue, assigneeReport }) => {
  if (assigneeReport) {
    return null
  }

  const withRevenue = [
    TotalRevenueBox,
    Workload,
    NoShowsBox,
    KeyMetricBox
  ]

  const withoutRevenue = [
    TotalPatientsBox,
    Workload,
    NoShowsBox,
    KeyMetricBox
  ]

  const boxes = showRevenue
    ? withRevenue
    : withoutRevenue

  return (
    <div className='row'>
      {
        boxes.map((box, i) =>
          <div key={i} className='col-md-3 col-sm-3 col-xs-12'>
            {React.createElement(box, {
              position: i + 1,
              color: report.calendar.color,
              report
            })}
          </div>
        )
      }
    </div>
  )
}
