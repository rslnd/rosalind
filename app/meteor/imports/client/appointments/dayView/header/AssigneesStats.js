import React from 'react'
import moment from 'moment'
import idx from 'idx'
import { mapAppointmentsByTags } from '../../../../api/reports/methods/mapAssignees'
import { Icon } from '../../../components/Icon'
import { Tags } from '../../../../api/tags/'

const barStyle = {
  height: 98,
  marginTop: 5,
  position: 'relative',
  top: 60,
  paddingLeft: 60,
  display: 'flex'
}

const containerStyle = {
  flex: 1,
  borderLeft: '1px solid #d2d6de',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

const cellStyle = {
  textAlign: 'center'
}

const Stats = ({ assignee }) => {
  const tagMapping = Tags.methods.getMappingForReports()
  const report = mapAppointmentsByTags({
    appointments: assignee.appointments,
    tagMapping
  })

  const moreInfo = `Neu ${idx(report, _ => _.new.admitted) || 0}
OP ${idx(report, _ => _.surgery.admitted) || 0}
Kaustik ${idx(report, _ => _.cautery.admitted) || 0},
Kontrolle ${idx(report, _ => _.recall.admitted) || 0}`

  return <div style={cellStyle} title={moreInfo}>
    <span><Icon name='users' /> {idx(report, _ => _.total.planned)}</span><br />
    <span><Icon name='check' /> {idx(report, _ => _.total.admitted)}</span>&ensp;
    <span><Icon name='times' /> {idx(report, _ => _.total.noShow)}</span>&ensp;
  </div>
}

const shouldShow = (date) =>
  moment(date).isBefore(moment().startOf('day')) ||
  (moment(date).isSame(moment(), 'day') && moment().hours() >= 12)

export const AssigneesStats = ({ assignees, date }) => (
  shouldShow(date)
    ? <div style={barStyle}>
      {
        assignees.map((assignee) => (
          <div
            key={assignee.assigneeId}
            className='text-muted'
            style={containerStyle}>
              <Stats key={assignee.assigneeId} assignee={assignee} />
          </div>
        ))
      }
    </div>
    : null
)
