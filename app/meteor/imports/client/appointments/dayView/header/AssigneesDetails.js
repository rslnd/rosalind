import React from 'react'
import { Icon } from '../../../components/Icon'
import { TagsList } from '../../../tags/TagsList'

const barStyle = {
  minHeight: 40,
  marginTop: 43,
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
  alignItems: 'center',
  padding: 4
}

const leftAlign = {
  textAlign: 'left'
}

const Constraint = ({ constraint }) => (
  <div>
    {
      constraint.length
      ? <span>
        <Icon name='clock-o' /> {constraint.length} min {constraint.note && <span>&middot; {constraint.note}</span>}
      </span>
      : <span>
        <Icon name='info-circle' /> {constraint.note}
      </span>
    }
    {
      constraint.tags && <div style={leftAlign}><TagsList tiny tags={constraint.tags} /></div>
    }
  </div>
)

export const AssigneesDetails = ({ assignees }) => (
  <div style={barStyle}>
    {
      assignees.map((assignee) => (
        <div
          key={assignee.assigneeId}
          className='text-muted'
          style={cellStyle}>
          {
            assignee.constraints && assignee.constraints.map((constraint) => (
              <Constraint key={constraint._id} constraint={constraint} />
            ))
          }
        </div>
      ))
    }
  </div>
)
