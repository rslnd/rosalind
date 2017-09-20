import React from 'react'
import moment from 'moment'
import { dayToDate } from '../../util/time/day'

const colorMapping = {
  SS: 'rgb(215, 205, 108)',
  SN: 'rgb(158, 104, 87)',
  MS: 'rgb(165, 179, 82)',
  UB: 'rgb(105, 210, 116)',
  MM: 'rgb(186, 87, 122)',
  AL: 'rgb(87, 140, 189)',
  DK: 'rgb(103, 196, 174)'
}

const Assignees = ({ assignees }) => (
  <div style={{ paddingTop: 5, paddingBottom: 5 }}>
    {assignees.map((a, i) => (
      <div
        key={i}
        style={{ marginRight: 2, backgroundColor: colorMapping[a] }}
        className='avatar username img-sm'>{a}</div>
    ))}
  </div>
)

const Cell = (props) => (
  <td style={{
    height: 120,
    borderRight: '1px solid #ececec',
    padding: 5
  }}>
    <span className='pull-left'>
      <span style={{
        fontSize: 18
      }}>{props.day}&emsp;</span>
      {props.today && <span className='label label-success' style={{ opacity: 0.7 }}>Heute</span>}
    </span>
    <span className='pull-right' style={{
      fontSize: '28px'
    }}><b>{props.workload}</b>
      <small className='text-muted' style={{ fontSize: '19px' }}>%</small></span>

    <div className='row' style={{ marginTop: 60 }}>
      <div className='col-md-12'>
        <Assignees assignees={props.assignees} />
      </div>
    </div>
  </td>
)

const Day = ({ preview, mapUserIdToUsername }) => (
  <Cell
    day={moment(dayToDate(preview.day)).format('dd., D.M.')}
    assignees={preview.assignees
      .filter(a => a.assigneeId)
      .map(mapUserIdToUsername)
    }
    workload={preview.total.patients.total.planned}
  />
)

const SingleWeek = ({ preview, style, mapUserIdToUsername }) => (
  <tr style={style}>
    {
      preview.map(day =>
        <Day
          key={day.day.day}
          preview={day}
          mapUserIdToUsername={mapUserIdToUsername} />
      )
    }
  </tr>
)

export const Week = ({ preview, mapUserIdToUsername }) => (
  <div>
    <table>
      <tbody>
        <SingleWeek preview={preview.slice(0, 6)} mapUserIdToUsername={mapUserIdToUsername} />
        <SingleWeek
          preview={preview.slice(6)}
          style={{ borderTop: '1px solid #bababa', paddingTop: 10, marginTop: 10 }}
          mapUserIdToUsername={mapUserIdToUsername}
        />
      </tbody>
    </table>
  </div>
)
