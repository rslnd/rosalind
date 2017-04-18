import React from 'react'
import FlipMove from 'react-flip-move'
import 'moment-duration-format'
import { UserHelper } from 'client/ui/users/UserHelper'
import { TAPi18n } from 'meteor/tap:i18n'

import { Nil } from './shared/Nil'
import { Percent } from './shared/Percent'

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
      <th style={{ textAlign: align }}>Std</th>
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
      <th style={{ textAlign: align }}>pro Stunde</th>
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
      <tr key={assignee.userId || assignee.external.eoswin.id} className="bg-white">

        {/* Rank */}
        <td>{index + 1}</td>

        {/* Name */}
        <td>
          {
            assignee.userId
            ? <UserHelper userId={assignee.userId} />
            : <i className="text-muted">{TAPi18n.__('reports.unassigned')}</i>
          }
        </td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <td style={{ textAlign: align }}>3:30</td>

        {/* Total Patients [Plan (appointments count), Ist (admitted appointments, (Abs+%))] */}
        <Td><Percent part={80} of={306} /></Td>
        <Td><Percent part={76} of={202} /></Td>

        {/* davon NEU [Plan (Abs+%), Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={44} of={80} /></Td>
        <Td><Percent part={38} of={76} /></Td>

        {/* davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={9} of={80} /></Td>
        <Td><Percent part={9} of={76} /></Td>

        {/* davon OP [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={3} of={80} /></Td>
        <Td><Percent part={2} of={76} /></Td>

        {/* Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={9} of={80} /></Td>
        <Td><Percent part={9} of={76} /></Td>

        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        <Td style={{ textAlign: align }}>€ 359</Td>

        {/* Umsatz gesamt */}
        <Td style={{ textAlign: align }}>€ 2875</Td>
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

        <td>4 Ärzte</td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <Td>22:30</Td>

        {/* Total Patients [Plan (appointments count), Ist (admitted appointments, (Abs+%))] */}
        <Td>355</Td>
        <Td>318</Td>

        {/* davon NEU [Plan (Abs+%), Ist (Abs+%)]  */}
        <Td><Percent borderLeft part={355 - 45} of={355} /></Td>
        <Td><Percent part={318 - 44} of={318} /></Td>

        {/* davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={45} of={355} /></Td>
        <Td><Percent part={44} of={318} /></Td>

        {/* davon OP [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={15} of={355} /></Td>
        <Td><Percent part={13} of={318} /></Td>

        {/* Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={9} of={80} /></Td>
        <Td><Percent part={9} of={76} /></Td>

        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        <Td style={{ textAlign: align }}>€ 443</Td>

        {/* Umsatz gesamt */}
        <Td style={{ textAlign: align }}>€ 17250</Td>
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
