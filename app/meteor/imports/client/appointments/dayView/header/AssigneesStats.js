import React from 'react'
import moment from 'moment'
import uniqBy from 'lodash/fp/uniqBy'
import countBy from 'lodash/fp/countBy'
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

const cellStyle = {
  flex: 1,
  borderLeft: '1px solid #d2d6de',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

const calculateStats = ({ appointments, tagMapping }) => {
  const planned = uniqBy('patientId')(appointments
    .filter(a => a.patientId && a.canceled !== true)
  )

  const admitted = planned.filter(a => a.admittedAt)

  const admittedByTag = countBy(a => tagMapping[a.tags[0]])(admitted.filter(a => a.tags))

  return {
    planned: planned.length,
    admitted: admitted.length,
    noShow: planned.length - admitted.length,
    admittedByTag
  }
}

const Stats = ({ assignee }) => {
  const tagMapping = Tags.methods.getMappingForReports()
  const { planned, admitted, noShow, admittedByTag } = calculateStats({
    appointments: assignee.appointments,
    tagMapping
  })

  return <div>
    <span><Icon name='users' /> {planned}</span><br />
    <span><Icon name='check' /> {admitted} (
      <span>
        Neu {admittedByTag['new'] || 0}, 
        OP {admittedByTag['surgery'] || 0}
      </span><br />
      <span>
        Kaustik {admittedByTag['cautery'] || 0},
        Kontrolle {admittedByTag['recall'] || 0}
      </span>
    )</span><br />
    <span><Icon name='times' /> {noShow}</span><br />
  </div>
}

const shouldShow = (date) => moment(date).isBefore(moment().startOf('day'))

export const AssigneesStats = ({ assignees, date }) => (
  shouldShow(date)
    ? <div style={barStyle}>
      {
        assignees.map((assignee) => (
          <div
            key={assignee.assigneeId}
            className='text-muted'
            style={cellStyle}>
              <Stats key={assignee.assigneeId} assignee={assignee} />
          </div>
        ))
      }
    </div>
    : null
)
