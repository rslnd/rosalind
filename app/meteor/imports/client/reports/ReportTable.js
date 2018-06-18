import React from 'react'
import FlipMove from 'react-flip-move'
import moment from 'moment'
import 'moment-duration-format'
import idx from 'idx'
import find from 'lodash/fp/find'
import { TAPi18n } from 'meteor/tap:i18n'
import { durationFormat } from './shared/durationFormat'
import { Nil } from './shared/Nil'
import { Percent } from './shared/Percent'
import { Round } from './shared/Round'
import { Icon } from '../components/Icon'
import { percentage } from '../../util/format'
import { dayToDate } from '../../util/time/day'

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

const rankStyle = {
  width: 15
}

const disclaimerStyle = {
  backgroundColor: summaryRowStyle.backgroundColor,
  borderTop: '1px solid #ebf1f2',
  width: '100%',
  display: 'block',
  padding: 5,
  paddingLeft: 13
}

const colDivider = {
  ...align,
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

export const ReportTableHeader = ({ showRevenue, assigneeReport, calendar, mapReportAsToHeader }) => (
  <thead>
    <tr>
      <th className='col-md-2'>{
        assigneeReport
        ? TAPi18n.__('reports.date')
        : <span>
          <Icon name={calendar.icon} />
          &ensp;
          {calendar.name}
        </span>
      }</th>
      <th style={align}>Std.</th>
      <th colSpan={calendar.reportExpectedAsActual ? 2 : 3}>
        {(calendar && calendar.patientNamePlural) || TAPi18n.__('reports.patients')}
      </th>
      {
        (calendar && calendar.reportAs)
        ? calendar.reportAs.map(tag =>
          <th key={tag} style={center} colSpan={2}>{mapReportAsToHeader(tag)}</th>
        )
        : [
          <th key={1} style={center} colSpan={2}>Neu</th>,
          <th key={2} style={center} colSpan={2}>Kontrolle</th>,
          <th key={3} style={center} colSpan={2}>OP</th>,
          <th key={4} style={align} title='Kaustik'>Kau</th>,
          <th key={5} style={align} title='Kryo'>Kry</th>,
          <th key={6} style={center} colSpan={2}>Neu/Std.</th>
        ]
      }
      {assigneeReport && calendar && calendar.allowUnassigned && <th style={align} title='Einschub'>Ein</th>}
      {showRevenue && <th style={align} colSpan={2}>Umsatz</th>}
    </tr>

    <tr className='text-muted' style={{ backgroundColor: '#f7f8f9' }}>
      <th />
      <th />
      <th style={borderLeftStyle}>Plan</th>
      {
        calendar.reportExpectedAsActual
        ? <th key='actual' style={align} title='Behandelt'>Ist</th>
        : [
          <th key='admitted' style={align} title='Anwesend'>Anw.</th>,
          <th key='actual' style={align} title='Behandelt'>Ist</th>
        ]
      }
      {
        (calendar && calendar.reportAs)
        ? calendar.reportAs.map(tag =>
          [
            <th key={tag + 1} style={colDivider}>Plan</th>,
            <th key={tag + 2} style={align}>Ist</th>
          ]
        )
        : [
          <th key={1} style={colDivider}>Plan</th>,
          <th key={2} style={align}>Ist</th>,
          <th key={3} style={colDivider}>Plan</th>,
          <th key={4} style={align}>Ist</th>,
          <th key={5} style={colDivider}>Plan</th>,
          <th key={6} style={align}>Ist</th>,
          <th key={7} style={align}>Ist</th>,
          <th key={8} style={align}>Ist</th>,
          <th key={9} style={colDivider}>Plan</th>,
          <th key={10} style={align}>Ist</th>
        ]
      }
      {assigneeReport && <th />}
      {calendar && calendar.reportRevenuePerHour && showRevenue && <th style={align}>€/h</th>}
      {showRevenue && <th style={align}>Gesamt</th>}
    </tr>
  </thead>
)

const AssigneeName = ({ assignee, mapUserIdToName }) =>
  <span>
    {
      assignee.assigneeId
      ? mapUserIdToName(assignee.assigneeId)
      : (
        assignee.type
        ? (assignee.type && <i className='text-muted'>{TAPi18n.__(`reports.assigneeType__${assignee.type}`)}</i>)
        : <i className='text-muted'>{TAPi18n.__('reports.unassigned')}</i>
      )
    }
  </span>

const Date = ({ day }) =>
  <span>
    {moment(dayToDate(day)).format(TAPi18n.__('time.dateFormatWeekdayShort'))}
  </span>

const getKey = assignee => {
  if (assignee.day) {
    return moment(dayToDate(assignee.day)).format()
  } else {
    return assignee.day || assignee.assigneeId || assignee.type || 'unassigned'
  }
}

const Overbooking = ({ assignee }) => {
  const planned = idx(assignee, _ => _.overbooking.patients.total.planned)
  const admitted = idx(assignee, _ => _.overbooking.patients.total.admitted)

  const title = TAPi18n.__('reports.overbookingSummary', { expected: planned, admitted })
  if (planned > 0) {
    return <span className='text-muted' title={title}>
      {admitted}/{planned}
    </span>
  } else {
    return <Nil />
  }
}

export const ReportTableBody = ({ showRevenue, report, mapUserIdToName, assigneeReport, calendar }) => (
  <FlipMove
    duration={200}
    typeName='tbody'
    leaveAnimation='none'
    enterAnimation='none'
    staggerDelayBy={160}
    staggerDurationBy={60}
    disableAllAnimations={assigneeReport}>
    {report.assignees.filter(a => a.type !== 'overbooking').map((assignee, index) => (
      <tr key={getKey(assignee)} className='bg-white'>
        {/* Name or Date */}
        <td>{
          assigneeReport
          ? <Date day={assignee.day} />
          : <AssigneeName assignee={assignee} mapUserIdToName={mapUserIdToName} />
        }</td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <td style={align}>{assignee.assigneeId && assignee.hours && durationFormat(assignee.hours.planned)}</td>

        {/* Patients [Plan=Expected, Admitted, Actual] */}
        <Td borderLeft>{idx(assignee, _ => _.patients.total.expected) || <Nil />}</Td>

        {
          calendar.reportExpectedAsActual
          ? <Td><Percent part={idx(assignee, _ => _.patients.total.admitted)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>
          : [
            <Td key='admitted'><Percent part={idx(assignee, _ => _.patients.total.admitted)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>,
            <Td key='actual'><Percent part={idx(assignee, _ => _.patients.total.actual)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>
          ]
        }

        {
          (calendar && calendar.reportAs)
          ? calendar.reportAs.map(tag =>
            [
              <Td key={1} borderLeft><Percent part={idx(assignee, _ => _.patients[tag].expected)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>,

              calendar.reportExpectedAsActual
              ? <Td key={2}>{
                (assignee.type !== 'external')
                ? <Percent
                  part={idx(assignee, _ => _.patients[tag].admitted)}
                  of={idx(assignee, _ => _.patients.total.admitted)} />
                : idx(assignee, _ => _.patients[tag].admitted)
              }</Td>
              : <Td key={2}>{
                (assignee.type !== 'external')
                ? <Percent
                  part={idx(assignee, _ => _.patients[tag].actual)}
                  of={idx(assignee, _ => _.patients.total.actual)} />
                : idx(assignee, _ => _.patients[tag].actual)
              }</Td>
            ]
          ) : [
            // davon NEU [Plan (Abs+%), Ist (Abs+%)]
            <Td key={1} borderLeft><Percent part={idx(assignee, _ => _.patients.new.expected)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>,
            <Td key={2}>{(assignee.type !== 'external') ? <Percent part={idx(assignee, _ => _.patients.new.actual)} of={idx(assignee, _ => _.patients.total.actual)} /> : idx(assignee, _ => _.patients.new.actual)}</Td>,

            // davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]
            <Td key={3} borderLeft><Percent part={idx(assignee, _ => _.patients.recall.expected)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>,
            <Td key={4}>{(assignee.type !== 'external') ? <Percent part={idx(assignee, _ => _.patients.recall.actual)} of={idx(assignee, _ => _.patients.total.actual)} /> : idx(assignee, _ => _.patients.recall.actual)}</Td>,

            // davon OP [Plan (Abs+%) , Ist (Abs+%)]
            <Td key={5} borderLeft>{idx(assignee, _ => _.patients.surgery.expected) || <Nil />}</Td>,
            <Td key={6}>{idx(assignee, _ => _.patients.surgery.actual) || <Nil />}</Td>,

            // Kaustik [Ist]
            <Td key={7}>{idx(assignee, _ => _.patients.cautery.actual) || <Nil />}</Td>,

            // Kryo [Ist]
            <Td key={8}>{idx(assignee, _ => _.patients.cryo.actual) || <Nil />}</Td>,

            // Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]
            <Td key={9} borderLeft>{assignee.assigneeId &&
              <Round number={idx(assignee, _ => _.patients.new.expectedPerHour)} /> || <Nil />
            }</Td>,
            <Td key={10}>{assignee.assigneeId &&
              <Round number={idx(assignee, _ => _.patients.new.actualPerHour)} /> || <Nil />
            }</Td>
          ]
        }
        {/* Assignee reports include overbooking column */}
        {
          assigneeReport && <Td><Overbooking assignee={assignee} /></Td>
        }

        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        {
          (calendar && calendar.reportRevenuePerHour && showRevenue) &&
            <Td borderLeft style={align}>{assignee.assigneeId &&
              <Round to={0} unit='€' number={
                idx(assignee, _ => _.revenue.total.actualPerHour) ||
                idx(assignee, _ => _.revenue.total.expectedPerHour)} /> || <Nil />
            }</Td>
        }

        {/* Umsatz gesamt */}
        {
          showRevenue &&
            <Td style={align}>{
              <Round to={0} unit='€' number={
                idx(assignee, _ => _.revenue.total.actual) ||
                idx(assignee, _ => _.revenue.total.expected)} />
            }</Td>
        }
      </tr>
    ))}
    <SummaryRow
      report={report}
      calendar={report.calendar}
      showRevenue={showRevenue}
      assigneeReport={assigneeReport}
     />
  </FlipMove>
)

class SummaryRow extends React.Component {
  render () {
    const { report, showRevenue, assigneeReport, calendar } = this.props
    return (
      <tr style={summaryRowStyle} className='bg-white'>
        <td>{
          !assigneeReport &&
          <span>
            {report.total.assignees}
            &nbsp;
            {
              (report.total.assignees === 1)
              ? (calendar.assigneeName || TAPi18n.__('reports.assignee', { count: report.total.assignees }))
              : (calendar.assigneeNamePlural || TAPi18n.__('reports.assignee', { count: report.total.assignees }))
            }
          </span>
        }</td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <Td>{idx(report, _ => _.total.hours) && durationFormat(report.total.hours.planned)}</Td>

        {/* Patients [planned, admitted, weighted workload] */}
        <Td borderLeft>{idx(report, _ => _.total.patients.total.expected) || <Nil />}</Td>
        {
          calendar.reportExpectedAsActual
          ? <Td><Percent part={idx(report, _ => _.total.patients.total.admitted)} of={idx(report, _ => _.total.patients.total.expected)} /></Td>
          : [
            <Td key='admitted'><Percent part={idx(report, _ => _.total.patients.total.admitted)} of={idx(report, _ => _.total.patients.total.expected)} /></Td>,
            <Td key='actual'>
              <span>
                {idx(report, _ => _.total.patients.total.actual)}
                <small className='text-muted'>
                  <br />
                  {percentage({ value: idx(report, _ => _.total.workload.weighted) })}
                </small>
              </span>
            </Td>
          ]
        }

        {
          (calendar && calendar.reportAs)
          ? calendar.reportAs.map(tag =>
            [
              <Td key={1} borderLeft><Percent part={idx(report, _ => _.total.patients[tag].expected)} of={idx(report, _ => _.total.patients.total.expected)} /></Td>,

              calendar.reportExpectedAsActual
              ? <Td key={2}><Percent part={idx(report, _ => _.total.patients[tag].expected)} of={idx(report, _ => _.total.patients.total.expected)} /></Td>
              : <Td key={2}><Percent part={idx(report, _ => _.total.patients[tag].actual)} of={idx(report, _ => _.total.patients.total.actual)} /></Td>
            ]
          ) : [
            // davon NEU [Plan (Abs+%), Ist (Abs+%)]
            <Td key={1} borderLeft><Percent part={idx(report, _ => _.total.patients.new.expected)} of={idx(report, _ => _.total.patients.total.expected)} /></Td>,
            <Td key={2}><Percent part={idx(report, _ => _.total.patients.new.actual)} of={idx(report, _ => _.total.patients.total.actual)} /></Td>,

            // davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]
            <Td key={3} borderLeft><Percent part={idx(report, _ => _.total.patients.recall.expected)} of={idx(report, _ => _.total.patients.total.expected)} /></Td>,
            <Td key={4}><Percent part={idx(report, _ => _.total.patients.recall.actual)} of={idx(report, _ => _.total.patients.total.actual)} /></Td>,

            // davon OP [Plan (Abs+%) , Ist (Abs+%)]
            <Td key={5} borderLeft>{idx(report, _ => _.total.patients.surgery.expected)}</Td>,
            <Td key={6}>{idx(report, _ => _.total.patients.surgery.actual)}</Td>,

            // Kaustik [Ist]
            <Td key={7}>{idx(report, _ => _.total.patients.cautery.actual)}</Td>,

            // Kryo [Ist]
            <Td key={8}>{idx(report, _ => _.total.patients.cryo.actual)}</Td>,

            // Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]
            <Td key={9} borderLeft><Round unit='⌀' number={idx(report, _ => _.average.patients.new.expectedPerHour)} /></Td>,
            <Td key={10}><Round unit='⌀' number={idx(report, _ => _.average.patients.new.actualPerHour)} /></Td>
          ]
        }
        {/* Overbooking */}
        {assigneeReport && <Td />}

        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        {
          calendar && calendar.reportRevenuePerHour && showRevenue &&
            <Td borderLeft style={align}><Round to={0} unit='⌀ €' number={
              idx(report, _ => _.average.revenue.actualPerHour) || // backwards compatibility
              idx(report, _ => _.average.revenue.total.actualPerHour) ||
              idx(report, _ => _.average.revenue.total.expectedPerHour)
            } /></Td>
        }

        {/* Umsatz gesamt */}
        {showRevenue && <Td style={align}>
          {idx(report, _ => _.total.revenue.misattributed) > 0 &&
            <small className='text-muted' title='Summe der Leistungen, die nicht anwesenden ÄrztInnen zugerechnet wurde'>
              + <Round to={0} unit='€' number={
                idx(report, _ => _.total.revenue.misattributed) ||
                idx(report, _ => _.total.revenue.total.misattributed)
                } /><br />
            </small>
          }
          <Round to={0} unit='€' number={
            idx(report, _ => _.total.revenue.actual) || // backwards compatibility
            idx(report, _ => _.total.revenue.total.actual) ||
            idx(report, _ => _.total.revenue.total.expected)
          } />
        </Td>}
      </tr>
    )
  }
}

const Disclaimers = ({ report }) => {
  const misattributedRevenue = idx(report, _ => _.total.revenue.misattributed) || 0
  const overbooking = find(a => a.type === 'overbooking')(report.assignees)
  const expected = idx(overbooking, _ => _.patients.total.expected)
  const admitted = idx(overbooking, _ => _.patients.total.admitted)

  if (misattributedRevenue > 0 || expected > 0 || admitted > 0) {
    return <span className='text-muted' style={disclaimerStyle}>
      {(expected > 0 || admitted > 0) && TAPi18n.__('reports.overbookingSummary', { expected, admitted })}
      &emsp;
      {(misattributedRevenue > 0) && <span className='text-muted'>
        {TAPi18n.__('reports.misattributedRevenue')}:&nbsp;
        <Round to={0} unit='€' number={misattributedRevenue} className='text-muted' />
      </span>}
    </span>
  } else {
    return null
  }
}

export const ReportTable = ({ report, showRevenue, mapUserIdToName, assigneeReport, mapReportAsToHeader }) => (
  <div className='table-responsive enable-select'>
    <table className='table no-margin'>
      <ReportTableHeader
        calendar={report.calendar}
        showRevenue={showRevenue}
        assigneeReport={assigneeReport}
        mapReportAsToHeader={mapReportAsToHeader}
       />
      <ReportTableBody
        report={report}
        calendar={report.calendar}
        showRevenue={showRevenue}
        mapUserIdToName={mapUserIdToName}
        assigneeReport={assigneeReport}
       />
    </table>
    <Disclaimers report={report} />
  </div>
)
