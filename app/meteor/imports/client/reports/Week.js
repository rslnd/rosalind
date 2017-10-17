import React from 'react'
import moment from 'moment'
import idx from 'idx'
import ColorHash from 'color-hash'
import { percentage } from '../../util/format'
import { dayToDate } from '../../util/time/day'

const colorHash = new ColorHash({ saturation: 0.75, lightness: 0.65 })
const clampLower = n => (n < 0) ? 0 : n
const clampUpper = upper => n => clampLower((n > upper) ? upper : n)

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

const Workload = ({ workload }) => {
  if (!workload || workload.available === 0) {
    return null
  }

  const free = clampUpper(workload.available)(
    workload.available - workload.planned
  )

  const title = `${free} frei von ${workload.available}`

  return <span className='text-muted' title={title}>
    <b>{free}</b>/{workload.available}
  </span>
}

const Assignees = ({ assignees = [], workload, mapUserIdToName, mapUserIdToUsername }) => (
  <div style={{ paddingTop: 5, paddingBottom: 5, minHeight: 30 }}>
    <div className='pull-left'>
      {assignees
        .map((id, i) => (
          <span
            key={i}
            className='print-color'
            style={{ ...avatarStyle, backgroundColor: colorHash.hex(id) }}
            title={mapUserIdToName(id)}>{mapUserIdToUsername(id)}</span>
      ))}
    </div>

    <div className='pull-right'>
      <Workload workload={workload} />
    </div>
  </div>
)

const Cell = ({ day, today, style, am, pm, workload, mapUserIdToName, mapUserIdToUsername }) => (
  <td style={{
    height: 120,
    padding: 5,
    ...style
  }}>
    <span className='pull-left'>
      <span style={{
        fontSize: 18
      }}>{day}&emsp;</span>
      <br />
      {
        today &&
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
        workload > 0 &&
          <span>
            <b>{workload}</b>
            <small className='text-muted' style={{ fontSize: '19px' }}>%</small>
          </span>
      }
    </span>

    <div className='row' style={{ marginTop: 50 }}>
      <div className='col-md-12'>
        <Assignees
          assignees={am.assignees}
          workload={am.workload}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
        />
      </div>
    </div>
    <div className='row'>
      <div className='col-md-12' style={{ marginTop: -7 }}>
        <Assignees
          assignees={pm.assignees}
          workload={pm.workload}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
        />
      </div>
    </div>
  </td>
)

const Day = ({ preview, style, mapUserIdToName, mapUserIdToUsername }) => {
  const total = idx(preview, _ => _.total.workload.available)
  const booked = clampUpper(total)(idx(preview, _ => _.total.workload.planned) || idx(preview, _ => _.total.workload.actual))
  const free = clampLower(total - booked)

  return <Cell
    day={moment(dayToDate(preview.day)).format('dd., D.M.')}
    style={style}
    today={preview.today}
    am={{
      assignees: idx(preview, _ => _.total.hours.am.assignees),
      workload: idx(preview, _ => _.total.workload.am)
    }}
    pm={{
      assignees: idx(preview, _ => _.total.hours.pm.assignees),
      workload: idx(preview, _ => _.total.workload.pm)
    }}
    workload={Math.round((
      idx(preview, _ => _.total.workload.weighted) ||
        (idx(preview, _ => _.total.workload.planned) / idx(preview, _ => _.total.workload.available))
    ) * 100)}
    mapUserIdToName={mapUserIdToName}
    mapUserIdToUsername={mapUserIdToUsername}
  />
}

const SingleWeek = ({ preview, style, mapUserIdToName, mapUserIdToUsername }) => (
  <tr style={style}>
    {
      preview.map((day, i) =>
        <Day
          key={day.day.day}
          preview={day}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
          style={{ borderRight: i < preview.length - 1 ? '1px solid #ececec' : 'none' }}
        />
      )
    }
  </tr>
)

export const Week = ({ preview, mapUserIdToName, mapUserIdToUsername }) => (
  <div>
    <table style={{ width: '100%' }}>
      <tbody>
        <SingleWeek
          preview={preview.slice(0, 6)}
          style={{ borderBottom: '1px solid #ececec' }}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
        />

        <SingleWeek
          preview={preview.slice(6, 12)}
          style={{ borderBottom: '1px solid #ececec' }}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
        />

        <SingleWeek
          preview={preview.slice(12)}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
        />
      </tbody>
    </table>
  </div>
)
