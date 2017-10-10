import React from 'react'
import moment from 'moment'
import idx from 'idx'
import ColorHash from 'color-hash'
import { percentage } from '../../util/format'
import { dayToDate } from '../../util/time/day'

const colorHash = new ColorHash({ saturation: 0.75, lightness: 0.65 })

const avatarStyle = {
  color: '#fefefe',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  textAlign: 'center',
  paddingTop: 7,
  fontSize: '11px',
  overflow: 'hidden',
  marginRight: 2,
  display: 'inline-block',
  borderRadius: '100%',
  width: 30,
  height: 30,
  'WebkitPrintColorAdjust': 'exact'
}

const Assignees = ({ assignees }) => (
  <div style={{ paddingTop: 5, paddingBottom: 5, minHeight: 30 }}>
    {assignees
      .map((a, i) => (
        <span
          key={i}
          className='print-color'
          style={{ ...avatarStyle, backgroundColor: colorHash.hex(a.assigneeId) }}
          title={a.fullNameWithTitle}>{a.username}</span>
    ))}
  </div>
)

const Cell = (props) => (
  <td style={{
    height: 120,
    padding: 5,
    ...props.style
  }}>
    <span className='pull-left'>
      <span style={{
        fontSize: 18
      }}>{props.day}&emsp;</span>
      <br />
      {
        props.today &&
          <span className='label label-success' style={{ opacity: 0.7 }}>
            Heute
          </span>
      }

    </span>

    <span className='pull-right' style={{
      fontSize: '28px',
      marginTop: -11
    }}>
      {
        props.workload > 0 &&
          <span>
            <b>{props.workload}</b>
            <small className='text-muted' style={{ fontSize: '19px' }}>%</small>
          </span>
      }
    </span>

    <div className='row' style={{ marginTop: 60 }}>
      <div className='col-md-12'>
        <Assignees assignees={props.assignees} />
      </div>
    </div>
  </td>
)

const Day = ({ preview, style }) => (
  <Cell
    day={moment(dayToDate(preview.day)).format('dd., D.M.')}
    style={style}
    today={preview.today}
    assignees={preview.assignees}
    workload={Math.round((
      idx(preview, _ => _.total.workload.weighted) ||
        (idx(preview, _ => _.total.workload.planned) / idx(preview, _ => _.total.workload.available))
    ) * 100)}
  />
)

const SingleWeek = ({ preview, style }) => (
  <tr style={style}>
    {
      preview.map((day, i) =>
        <Day
          key={day.day.day}
          preview={day}
          style={{ borderRight: i < preview.length - 1 ? '1px solid #ececec' : 'none' }}
        />
      )
    }
  </tr>
)

export const Week = ({ preview }) => (
  <div>
    <table style={{ width: '100%' }}>
      <tbody>
        <SingleWeek preview={preview.slice(0, 6)} style={{ borderBottom: '1px solid #ececec' }} />
        <SingleWeek preview={preview.slice(6, 12)} style={{ borderBottom: '1px solid #ececec' }} />
        <SingleWeek
          preview={preview.slice(12)}
        />
      </tbody>
    </table>
  </div>
)
