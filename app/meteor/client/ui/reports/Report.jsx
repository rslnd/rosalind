import React from 'react'
import FlipMove from 'react-flip-move'
import { UserHelper } from 'client/ui/users/UserHelper'
import { TAPi18n } from 'meteor/tap:i18n'

const Nil = () => (
  <span className="text-quite-muted">&ndash;</span>
)

export const ReportTableHeader = ({ showRevenue }) => (
  <thead>
    <tr>
      <th>#</th>
      <th className="col-md-2">Arzt</th>
      <th>Stunden</th>
      <th className="td-bg" width="150px">Patienten</th>
      <th className="td-bg">Neu</th>
      <th className="td-bg">Kontrolle</th>
      <th className="td-bg">Neu/h</th>
      <th className="td-bg">Gesamt</th>
      <th className="OP">OP</th>
      {showRevenue && <th>Umsatz</th>}
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
      <tr key={assignee.id} className="bg-white">
        <td>{index + 1}</td>
        <td>
          {
            assignee.id
            ? <UserHelper userId={assignee.id} />
            : <i className="text-muted">{TAPi18n.__('reports.unassigned')}</i>
          }
        </td>
        <td>
          {assignee.hours.actual && assignee.hours.actual.toFixed(1)}
          {assignee.hours.scheduled && (
            <span>
              {assignee.hours.scheduled.toFixed(1)}
              <small className="fa fa-question-circle text-quite-muted">{TAPi18n.__('reports.scheduledOnly')}</small>
            </span>
          )}
        </td>
        <td className="td-bg on-hover-here">
          <div className="progress bg-aqua-light">
            <div className="progress-bar progress-bar-aqua" style={{width: `${assignee.patients.newPercentage}%`}}>
              <div className="on-hover-show show-print">{Math.floor(assignee.patients.newPercentage)}% {TAPi18n.__('reports.newPercentage')}</div>
            </div>
          </div>
        </td>
        <td className="td-bg">{assignee.patients.new || <Nil />}</td>
        <td className="td-bg">{assignee.patients.recall || <Nil />}</td>
        <td className="td-bg">{assignee.patients.newPerHourScheduled.toFixed(1)}</td>
        <td className="td-bg">{assignee.patients.total}</td>
        <td>{assignee.patients.surgeries || <Nil />}</td>
        {showRevenue && <td>€{assignee.revenue}</td>}
      </tr>
    ))}
  </FlipMove>
)

export const Report = ({ report, showRevenue }) => (
  <div className="box box-info">
    <div className="box-body no-padding">
      <div className="table-responsive">
        <table className="table no-margin">
          <ReportTableHeader showRevenue={showRevenue} />
          <ReportTableBody report={report} showRevenue={showRevenue} />
        </table>
      </div>
    </div>
  </div>
)
