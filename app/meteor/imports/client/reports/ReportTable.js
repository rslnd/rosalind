import React from 'react'
import FlipMove from 'react-flip-move'
import 'moment-duration-format'
import idx from 'idx'
import { durationFormat } from './shared/durationFormat'
import { Nil } from './shared/Nil'
import { Percent } from './shared/Percent'
import { Round } from './shared/Round'

const align = {
  textAlign: 'right'
}

const center = {
  textAlign: 'center'
}

const summaryRowStyle = {
  borderTop: '4px double #ebf1f2',
  backgroundColor: '#f7f8f9'
}

const colDivider = {
  borderTop: '2px solid #ebf1f2',
  backgroundColor: '#f7f8f9'
}

const borderLeftStyle = {
  ...align,
  borderLeft: '0.5px solid #ebf1f2'
}

const Td = ({ children, borderLeft }) => (
  <td style={borderLeft ? borderLeftStyle : align}>
    {children}
  </td>
)

export const ReportTableHeader = ({ showRevenue, __ }) => (
  <thead>
    <tr>
      <th>#</th>
      <th className='col-md-2'>{__('reports.assignee')}</th>
      <th style={align}>Std.</th>
      <th style={align} colSpan={2}>Termine</th>
      <th style={align} colSpan={2}>PatientInnen</th>
      <th style={center} colSpan={2}>Neu</th>
      <th style={center} colSpan={2}>Kontrolle</th>
      <th style={center} colSpan={2}>OP</th>
      <th style={center} title='Kaustik privat'>K</th>
      <th style={align} colSpan={2}>Neu/Std.</th>
      {showRevenue && <th style={align} colSpan={2}>Umsatz</th>}
    </tr>

    <tr className='text-muted' style={{ backgroundColor: '#f7f8f9' }}>
      <th />
      <th />
      <th />
      <th style={align}>Plan</th>
      <th style={align}>Ist</th>
      <th style={align}>Plan</th>
      <th style={align}>Ist</th>
      <th style={colDivider}>Plan</th>
      <th style={align}>Ist</th>
      <th style={colDivider}>Plan</th>
      <th style={align}>Ist</th>
      <th style={colDivider}>Plan</th>
      <th style={align}>Ist</th>
      <th style={align}>Plan</th>
      <th style={colDivider}>Plan</th>
      <th style={align}>Ist</th>
      {showRevenue && <th style={align}>€/h</th>}
      {showRevenue && <th style={align}>Gesamt</th>}
    </tr>
  </thead>
)

export const ReportTableBody = ({ showRevenue, report, mapUserIdToName, __ }) => (
  <FlipMove
    duration={200}
    typeName='tbody'
    leaveAnimation='none'
    enterAnimation='none'
    staggerDelayBy={160}
    staggerDurationBy={60}>
    {report.assignees.map((assignee, index) => (
      <tr key={assignee.assigneeId || assignee.type || 'unassigned'} className='bg-white'>

        {/* Rank */}
        <td className='text-muted'>{assignee.assigneeId && index + 1}</td>

        {/* Name */}
        <td>
          {
            assignee.assigneeId
            ? mapUserIdToName(assignee.assigneeId)
            : (
              assignee.type
              ? (assignee.type && <i className='text-muted'>{__(`reports.assigneeType__${assignee.type}`)}</i>)
              : <i className='text-muted'>{__('reports.unassigned')}</i>
            )
          }
        </td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <td style={align}>{assignee.assigneeId && assignee.hours && durationFormat(assignee.hours.planned)}</td>

        {/* Termine [Plan, Ist] */}
        <td style={align}>{assignee.assigneeId && assignee.workload &&
          <Percent slash bigPercent part={assignee.workload.planned} of={assignee.workload.available} />
        }</td>
        <td style={align}>{assignee.assigneeId && assignee.workload &&
          <Percent slash bigPercent part={assignee.patients.total.actual} of={assignee.workload.planned} />
        }</td>

        {/* Total Patients [Plan (appointments count), Ist (admitted appointments, (Abs+%))] */}
        <Td borderLeft>{idx(assignee, _ => _.patients.total.planned)}</Td>
        <Td>{idx(assignee, _ => _.patients.total.actual) || <Nil />}</Td>

        {/* davon NEU [Plan (Abs+%), Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(assignee, _ => _.patients.new.planned)} of={assignee.patients.total.planned} /></Td>
        <Td><Percent part={idx(assignee, _ => _.patients.new.actual)} of={idx(assignee, _ => _.patients.total.actual)} /></Td>

        {/* davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(assignee, _ => _.patients.recall.planned)} of={assignee.patients.total.planned} /></Td>
        <Td><Percent part={idx(assignee, _ => _.patients.recall.actual)} of={assignee.patients.total.actual} /></Td>

        {/* davon OP [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(assignee, _ => _.patients.surgery.planned)} of={assignee.patients.total.planned} /></Td>
        <Td><Percent part={idx(assignee, _ => _.patients.surgery.actual)} of={assignee.patients.total.actual} /></Td>

        {/* Kaustik privat [Plan] */}
        <Td><Percent part={idx(assignee, _ => _.patients.cautery.planned)} of={assignee.patients.total.planned} /></Td>

        {/* Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft>{assignee.assigneeId &&
          <Round number={idx(assignee, _ => _.patients.new.plannedPerHour)} />
        }</Td>
        <Td>{assignee.assigneeId &&
          <Round number={idx(assignee, _ => _.patients.new.actualPerHour)} />
        }</Td>

        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        {
          showRevenue &&
            <Td borderLeft style={align}>{assignee.assigneeId &&
              <Round to={0} unit='€' number={idx(assignee, _ => _.revenue.total.actualPerHour)} /> || <Nil />
            }</Td>
        }

        {/* Umsatz gesamt */}
        {
          showRevenue &&
            <Td style={align}>{
              <Round to={0} unit='€' number={idx(assignee, _ => _.revenue.total.actual)} /> || <Nil />
            }</Td>
        }
      </tr>
    ))}
    <SummaryRow report={report} showRevenue={showRevenue} __={__} />
  </FlipMove>
)

class SummaryRow extends React.Component {
  render () {
    const { report, showRevenue, __ } = this.props
    return (
      <tr style={summaryRowStyle} className='bg-white'>
        <td><b>∑</b></td>

        <td>{report.total.assignees} {__('reports.assignees')}</td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <Td>{report.total.hours && durationFormat(report.total.hours.planned)}</Td>

        {/* Auslatung [Plan, Ist] */}
        <Td><Percent slash bigPercent part={report.total.workload.planned} of={report.total.workload.available} /></Td>
        <Td><Percent slash bigPercent part={report.total.workload.actual} of={report.total.workload.available} /></Td>

        {/* Total Patients [Plan (appointments count), Ist (admitted appointments, (Abs+%))] */}
        <Td borderLeft>{report.total.patients.total.planned}</Td>
        <Td>{idx(report, _ => _.total.patients.total.actual) || <Nil />}</Td>

        {/* davon NEU [Plan (Abs+%), Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(report, _ => _.total.patients.new.planned)} of={report.total.patients.total.planned} /></Td>
        <Td><Percent part={idx(report, _ => _.total.patients.new.actual)} of={idx(report, _ => _.total.patients.total.actual)} /></Td>

        {/* davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(report, _ => _.total.patients.recall.planned)} of={report.total.patients.total.planned} /></Td>
        <Td><Percent part={idx(report, _ => _.total.patients.recall.actual)} of={idx(report, _ => _.total.patients.total.actual)} /></Td>

        {/* davon OP [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(report, _ => _.total.patients.surgery.planned)} of={report.total.patients.total.planned} /></Td>
        <Td><Percent part={idx(report, _ => _.total.patients.surgery.actual)} of={idx(report, _ => _.total.patients.total.actual)} /></Td>

        {/* Kaustik privat [Plan] */}
        <Td><Percent part={idx(report, _ => _.total.patients.cautery.planned)} of={idx(report, _ => _.total.patients.total.planned)} /></Td>

        {/* Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Round unit='⌀' number={idx(report, _ => _.average.patients.new.plannedPerHour)} /></Td>
        <Td><Round unit='⌀' number={idx(report, _ => _.average.patients.new.actualPerHour)} /></Td>

        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        {showRevenue && <Td borderLeft style={align}><Round to={0} unit='⌀ €' number={idx(report, _ => _.average.revenue.actualPerHour)} /></Td>}

        {/* Umsatz gesamt */}
        {showRevenue && <Td style={align}><Round to={0} unit='€' number={idx(report, _ => _.total.revenue.actual)} /></Td>}
      </tr>
    )
  }
}

export const ReportTable = ({ report, showRevenue, mapUserIdToName, __ }) => (
  <div className='table-responsive enable-select'>
    <table className='table no-margin'>
      <ReportTableHeader showRevenue={showRevenue} __={__} />
      <ReportTableBody report={report} showRevenue={showRevenue} mapUserIdToName={mapUserIdToName} __={__} />
    </table>
  </div>
)
