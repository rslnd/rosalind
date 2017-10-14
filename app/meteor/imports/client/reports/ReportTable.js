import React from 'react'
import FlipMove from 'react-flip-move'
import 'moment-duration-format'
import idx from 'idx'
import find from 'lodash/fp/find'
import { durationFormat } from './shared/durationFormat'
import { Nil } from './shared/Nil'
import { Percent } from './shared/Percent'
import { Round } from './shared/Round'
import { Icon } from '../components/Icon'
import { percentage } from '../../util/format'

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
  paddingLeft: rankStyle.width + 17
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
      <th style={rankStyle}>#</th>
      <th className='col-md-2'>{__('reports.assignee')}</th>
      <th style={align}>Std.</th>
      <th colSpan={3}>PatientInnen</th>
      <th style={center} colSpan={2}>Neu</th>
      <th style={center} colSpan={2}>Kontrolle</th>
      <th style={center} colSpan={2}>OP</th>
      <th style={align} title='Kaustik'>Kau</th>
      <th style={align} title='Kryo'>Kry</th>
      <th style={center} colSpan={2}>Neu/Std.</th>
      {showRevenue && <th style={align} colSpan={2}>Umsatz</th>}
    </tr>

    <tr className='text-muted' style={{ backgroundColor: '#f7f8f9' }}>
      <th />
      <th />
      <th />
      <th style={borderLeftStyle}>Plan</th>
      <th style={align} title='Anwesend'>Anw.</th>
      <th style={align} title='Behandelt'>Ist</th>
      <th style={colDivider}>Plan</th>
      <th style={align}>Ist</th>
      <th style={colDivider}>Plan</th>
      <th style={align}>Ist</th>
      <th style={colDivider}>Plan</th>
      <th style={align}>Ist</th>
      <th style={align}>Ist</th>
      <th style={align}>Ist</th>
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
    {report.assignees.filter(a => a.type !== 'overbooking').map((assignee, index) => (
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

        {/* Patients [Plan=Expected, Admitted, Actual] */}
        <Td borderLeft>{idx(assignee, _ => _.patients.total.expected) || <Nil />}</Td>
        <Td><Percent part={idx(assignee, _ => _.patients.total.admitted)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>
        <Td><Percent part={idx(assignee, _ => _.patients.total.actual)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>

        {/* davon NEU [Plan (Abs+%), Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(assignee, _ => _.patients.new.expected)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>
        <Td>{(assignee.type !== 'external') ? <Percent part={idx(assignee, _ => _.patients.new.actual)} of={idx(assignee, _ => _.patients.total.actual)} /> : idx(assignee, _ => _.patients.new.actual)}</Td>

        {/* davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(assignee, _ => _.patients.recall.expected)} of={idx(assignee, _ => _.patients.total.expected)} /></Td>
        <Td>{(assignee.type !== 'external') ? <Percent part={idx(assignee, _ => _.patients.recall.actual)} of={idx(assignee, _ => _.patients.total.actual)} /> : idx(assignee, _ => _.patients.recall.actual)}</Td>

        {/* davon OP [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft>{idx(assignee, _ => _.patients.surgery.expected) || <Nil />}</Td>
        <Td>{idx(assignee, _ => _.patients.surgery.actual) || <Nil />}</Td>

        {/* Kaustik [Ist] */}
        <Td>{idx(assignee, _ => _.patients.cautery.actual) || <Nil />}</Td>

        {/* Kryo [Ist] */}
        <Td>{idx(assignee, _ => _.patients.cryo.actual) || <Nil />}</Td>

        {/* Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft>{assignee.assigneeId &&
          <Round number={idx(assignee, _ => _.patients.new.expectedPerHour)} /> || <Nil />
        }</Td>
        <Td>{assignee.assigneeId &&
          <Round number={idx(assignee, _ => _.patients.new.actualPerHour)} /> || <Nil />
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
              <Round to={0} unit='€' number={idx(assignee, _ => _.revenue.total.actual)} />
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

        <td>{report.total.assignees} {__('reports.assignee', { count: report.total.assignees })}</td>

        {/* Stunden [von, bis, h, lt Terminkalender (Plan only)] (Split row by Vormittag/Nachmittag) */}
        <Td>{report.total.hours && durationFormat(report.total.hours.planned)}</Td>

        {/* Patients [planned, admitted, weighted workload] */}
        <Td borderLeft>{idx(report, _ => _.total.patients.total.expected) || <Nil />}</Td>
        <Td><Percent part={idx(report, _ => _.total.patients.total.admitted)} of={idx(report, _ => _.total.patients.total.expected)} /></Td>
        <Td>
          <span>
            {idx(report, _ => _.total.patients.total.actual)}
            <small className='text-muted'>
              <br />
              {percentage({ value: idx(report, _ => _.total.workload.weighted) })}
            </small>
          </span>
        </Td>

        {/* davon NEU [Plan (Abs+%), Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(report, _ => _.total.patients.new.expected)} of={report.total.patients.total.expected} /></Td>
        <Td><Percent part={idx(report, _ => _.total.patients.new.actual)} of={idx(report, _ => _.total.patients.total.actual)} /></Td>

        {/* davon Kontrolle [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Percent part={idx(report, _ => _.total.patients.recall.expected)} of={report.total.patients.total.expected} /></Td>
        <Td><Percent part={idx(report, _ => _.total.patients.recall.actual)} of={idx(report, _ => _.total.patients.total.actual)} /></Td>

        {/* davon OP [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft>{idx(report, _ => _.total.patients.surgery.expected)}</Td>
        <Td>{idx(report, _ => _.total.patients.surgery.actual)}</Td>

        {/* Kaustik [Ist] */}
        <Td>{idx(report, _ => _.total.patients.cautery.actual)}</Td>

        {/* Kryo [Ist] */}
        <Td>{idx(report, _ => _.total.patients.cryo.actual)}</Td>

        {/* Neu/Stunde [Plan (Abs+%) , Ist (Abs+%)]  */}
        <Td borderLeft><Round unit='⌀' number={idx(report, _ => _.average.patients.new.expectedPerHour)} /></Td>
        <Td><Round unit='⌀' number={idx(report, _ => _.average.patients.new.actualPerHour)} /></Td>

        {/* Umsatz pro Stunde (nicht VM/NM splittable) */}
        {showRevenue && <Td borderLeft style={align}><Round to={0} unit='⌀ €' number={idx(report, _ => _.average.revenue.actualPerHour)} /></Td>}

        {/* Umsatz gesamt */}
        {showRevenue && <Td style={align}>
          {idx(report, _ => _.total.revenue.misattributed) > 0 &&
            <small className='text-muted' title='Summe der Leistungen, die nicht anwesenden ÄrztInnen zugerechnet wurde'>
              + <Round to={0} unit='€' number={idx(report, _ => _.total.revenue.misattributed)} /><br />
            </small>
          }
          <Round to={0} unit='€' number={idx(report, _ => _.total.revenue.actual)} />
        </Td>}
      </tr>
    )
  }
}

const Disclaimers = ({ report, __ }) => {
  const misattributedRevenue = idx(report, _ => _.total.revenue.misattributed) || 0
  const overbooking = find(a => a.type === 'overbooking')(report.assignees)
  const expected = idx(overbooking, _ => _.patients.total.expected)
  const admitted = idx(overbooking, _ => _.patients.total.admitted)

  if (misattributedRevenue > 0 || expected > 0 || admitted > 0) {
    return <small className='text-muted' style={disclaimerStyle}>
      {(expected > 0 || admitted > 0) && __('reports.overbookingSummary', { expected, admitted })}
      &emsp;
      {(misattributedRevenue > 0) && <span className='text-muted'>
        {__('reports.misattributedRevenue')}:&nbsp;
        <Round to={0} unit='€' number={misattributedRevenue} className='text-muted' />
      </span>}
    </small>
  } else {
    return null
  }
}

export const ReportTable = ({ report, showRevenue, mapUserIdToName, __ }) => (
  <div className='table-responsive enable-select'>
    <table className='table no-margin'>
      <ReportTableHeader showRevenue={showRevenue} __={__} />
      <ReportTableBody report={report} showRevenue={showRevenue} mapUserIdToName={mapUserIdToName} __={__} />
    </table>
    <Disclaimers report={report} __={__} />
  </div>
)
