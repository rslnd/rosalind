import React from 'react'
import FlipMove from 'react-flip-move'
import 'moment-duration-format'
import idx from 'idx'
import { UserHelper } from 'client/ui/users/UserHelper'
import { TAPi18n } from 'meteor/tap:i18n'

import { durationFormat } from './shared/durationFormat'
import { Nil } from './shared/Nil'
import { Percent } from './shared/Percent'
import { Round } from './shared/Round'

const align = 'right'
const colDivider = '0.5px solid #ebf1f2'

const Td = ({ children, borderLeft }) => (
  <td style={{ textAlign: align, borderLeft: borderLeft && colDivider }}>
    {children}
  </td>
)

export const ReportTableHeader = ({ showRevenue }) => (
  <thead>
    <tr>
      <th>#</th>
      <th className="col-md-2">{TAPi18n.__('reports.assignee')}</th>
      <th style={{ textAlign: align }}>Std.</th>
      <th style={{ textAlign: align }}>Ausl.</th>
      <th style={{ textAlign: align }} colSpan={2}>PatientInnen</th>
      <th style={{ textAlign: 'center' }} colSpan={2}>Neu</th>
      <th style={{ textAlign: 'center' }} colSpan={2}>Kontrolle</th>
      <th style={{ textAlign: 'center' }} colSpan={2}>OP</th>
      <th style={{ textAlign: align }} colSpan={2}>Neu/Std.</th>
      <th style={{ textAlign: align }} colSpan={2}>Umsatz</th>
    </tr>

    <tr className="text-muted" style={{ backgroundColor: '#f7f8f9' }}>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th style={{ textAlign: align }}>Plan</th>
      <th style={{ textAlign: align }}>Ist</th>
      <th style={{ textAlign: align, borderLeft: colDivider }}>Plan</th>
      <th style={{ textAlign: align }}>Ist</th>
      <th style={{ textAlign: align, borderLeft: colDivider }}>Plan</th>
      <th style={{ textAlign: align }}>Ist</th>
      <th style={{ textAlign: align, borderLeft: colDivider }}>Plan</th>
      <th style={{ textAlign: align }}>Ist</th>
      <th style={{ textAlign: align, borderLeft: colDivider }}>Plan</th>
      <th style={{ textAlign: align }}>Ist</th>
      <th style={{ textAlign: align }}>pro Std.</th>
      <th style={{ textAlign: align }}>Gesamt</th>
    </tr>
  </thead>
)

export const ReportTableBody = ({ showRevenue, report }) => (
  <FlipMove
    duration={200}
    typeName="tbody"
    leaveAnimation="none"
    enterAnimation="none"
    staggerDelayBy={160}
    staggerDurationBy={60}>
    {report.assignees.map((assignee, index) => (
      <tr key={assignee.assigneeId || 'unassigned'} className="bg-white">

        {/* Rank */}
        <td className="text-muted">{index + 1}</td>

        {/* Name */}
        <td>
          {
            assignee.assigneeId
            ? <UserHelper userId={assignee.assigneeId} />
            : <i className="text-muted">{TAPi18n.__('reports.unassigned')}</i>
          }
        </td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <td style={{ textAlign: align }}>{assignee.assigneeId && durationFormat(assignee.hours.planned)}</td>

        {/* Auslastung */}
        <td style={{ textAlign: align }}>{assignee.assigneeId &&
          <Percent slash bigPercent part={assignee.workload.planned} of={assignee.workload.available} />
        }</td>


        {/* Total Patients [Plan (appointments count), Ist (admitted appointments, (Abs+%))] */}
        <Td>{idx(assignee, (_) => _.patients.total.planned)}</Td>
        <Td><Nil /></Td>

        {/* davon NEU [Plan (Abs+%), Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={assignee.patients.new.planned} of={assignee.patients.total.planned} /></Td>
        <Td><Nil /></Td>

        {/* davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={assignee.patients.recall.planned} of={assignee.patients.total.planned} /></Td>
        <Td><Nil /></Td>

        {/* davon OP [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(assignee, (_) => _.patients.surgery.planned)} of={assignee.patients.total.planned} /></Td>
        <Td><Nil /></Td>

        {/* Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft>{assignee.assigneeId &&
          <Round number={idx(assignee, (_) => _.patients.new.plannedPerHour)} />
        }</Td>
        <Td>{assignee.assigneeId &&
          <Nil />
        }</Td>
 
        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        <Td style={{ textAlign: align }}>{assignee.assigneeId &&
          <Nil />
        }</Td>

        {/* Umsatz gesamt */}
        <Td style={{ textAlign: align }}><Nil /></Td>
      </tr>
    ))}
    <SummaryRow report={report} />
  </FlipMove>
)

class SummaryRow extends React.Component {
  render () {
    const { report } = this.props
    return (
      <tr style={{ borderTop: '2px solid #ebf1f2', backgroundColor: '#f7f8f9' }} className="bg-white">
        <td><b>∑</b></td>

        <td>{report.total.assignees} {TAPi18n.__('reports.assignees')}</td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <Td>{durationFormat(report.total.hours.planned)}</Td>

        {/* Auslatung */}
        <Td><Percent slash bigPercent part={report.total.workload.planned} of={report.total.workload.available} /></Td>

        {/* Total Patients [Plan (appointments count), Ist (admitted appointments, (Abs+%))] */}
        <Td>{report.total.patients.total.planned}</Td>
        <Td><Nil /></Td>

        {/* davon NEU [Plan (Abs+%), Ist (Abs+%)]  */}
        <Td><Percent borderLeft part={report.total.patients.new.planned} of={report.total.patients.total.planned} /></Td>
        <Td><Nil /></Td>

        {/* davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={report.total.patients.recall.planned} of={report.total.patients.total.planned} /></Td>
        <Td><Nil /></Td>

        {/* davon OP [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={report.total.patients.surgery.planned} of={report.total.patients.total.planned} /></Td>
        <Td><Nil /></Td>

        {/* Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft>⌀ <Round number={idx(report, (_) => _.average.patients.new.plannedPerHour)} /></Td>
        <Td><Nil /></Td>

        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        <Td style={{ textAlign: align }}><Nil /></Td>

        {/* Umsatz gesamt */}
        <Td style={{ textAlign: align }}><Nil /></Td>
      </tr>
    )
  }
}

export const ReportTable = ({ report, showRevenue }) => (
  <div className="table-responsive enable-select">
    <table className="table no-margin">
      <ReportTableHeader showRevenue={showRevenue} />
      <ReportTableBody report={report} showRevenue={showRevenue} />
    </table>
  </div>
)
