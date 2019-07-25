import React from 'react'
import moment from 'moment-timezone'
import 'moment-duration-format'
import idx from 'idx'
import ColorHash from 'color-hash'
import { dayToDate } from '../../util/time/day'
import { __ } from '../../i18n';

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

const formatDuration = mins =>
  moment.duration(mins, 'minutes').format(__('time.durationFormatShort'), null, {
    trim: false
  })

const Workload = ({ workload }) => {
  if (!workload || workload.available === 0) {
    return null
  }

  const available = formatDuration(Math.round(workload.available))
  const free = formatDuration(Math.round(clampUpper(workload.available)(workload.available - workload.planned)))

  const title = `${free} Stunden frei von ${available} Stunden`

  return <span className='text-muted' title={title}>
    <b>{free}</b>/{available}
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
        (am.assignees.length > 0 || pm.assignees.length > 0) &&
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

const Day = ({ day, style, mapUserIdToName, mapUserIdToUsername }) => {
  return <Cell
    day={moment(dayToDate(day.day)).format('dd., D.M.')}
    style={style}
    today={day.today}
    am={{
      assignees: idx(day, _ => _.total.hours.am.assignees),
      workload: idx(day, _ => _.total.workload.am)
    }}
    pm={{
      assignees: idx(day, _ => _.total.hours.pm.assignees),
      workload: idx(day, _ => _.total.workload.pm)
    }}
    workload={Math.round((
      idx(day, _ => _.total.workload.weighted) ||
        (idx(day, _ => _.total.workload.planned) / idx(day, _ => _.total.workload.available))
    ) * 100)}
    mapUserIdToName={mapUserIdToName}
    mapUserIdToUsername={mapUserIdToUsername}
  />
}

const SingleWeek = ({ days, style, mapUserIdToName, mapUserIdToUsername }) => (
  <tr style={style}>
    {
      days.map((day, i) =>
        <Day
          key={day.day.day}
          day={day}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
          style={{ borderRight: i < days.length - 1 ? '1px solid #ececec' : 'none' }}
        />
      )
    }
  </tr>
)

export const Week = ({ days, mapUserIdToName, mapUserIdToUsername }) => (
  <div>
    <table style={{ width: '100%' }}>
      <tbody>
        <SingleWeek
          days={days.slice(0, 6)}
          style={{ borderBottom: '1px solid #ececec' }}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
        />

        <SingleWeek
          days={days.slice(6, 12)}
          style={{ borderBottom: '1px solid #ececec' }}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
        />

        <SingleWeek
          days={days.slice(12)}
          mapUserIdToName={mapUserIdToName}
          mapUserIdToUsername={mapUserIdToUsername}
        />
      </tbody>
    </table>
  </div>
)
