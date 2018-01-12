import React from 'react'
import { Icon } from '../../../components/Icon'
import { TagsList } from '../../../tags/TagsList'
import { background } from '../../../css/global'

const barStyle = {
  position: 'fixed',
  pointerEvents: 'none',
  minHeight: 40,
  marginTop: 43,
  top: 44,
  right: 15,
  left: 60,
  zIndex: 40,
  paddingLeft: 60,
  display: 'flex'
}

const cellStyle = {
  flex: 1,
  borderRadius: 4,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingLeft: 4,
  paddingRight: 4,
  paddingTop: 5,
  paddingBottom: 12
}

const relevantCellStyle = {
  background,
  borderBottom: '1px solid #d2d6de',
  pointerEvents: 'auto'
}

const leftAlign = {
  textAlign: 'left'
}

const Constraint = ({ constraint }) => (
  <div>
    {
      constraint.duration
      ? <span>
        <Icon name='clock-o' /> {constraint.duration} min {constraint.note && <span>&middot; {constraint.note}</span>}
      </span>
      : <span>
        {constraint.note}
      </span>
    }
    {
      constraint.tags && <div style={leftAlign}><TagsList tiny tags={constraint.tags} /></div>
    }
  </div>
)

const Cell = ({ assignee, expanded }) => {
  const isRelevant = (assignee.constraints && assignee.constraints.length > 0)
  const style = isRelevant
    ? { ...relevantCellStyle, ...cellStyle }
    : cellStyle

  return <div style={style}>
    {
      expanded && isRelevant && assignee.constraints.map((constraint) => (
        <div key={constraint._id}>
          <Icon name='info-circle' />
          <Constraint constraint={constraint} />
        </div>
      ))
    }
    {
      !expanded && isRelevant && <div>
        <Icon name='info-circle' />
      </div>
    }
  </div>
}

export const AssigneesDetails = ({ assignees, expanded }) => (
  <div style={barStyle}>
    {
      assignees.map((assignee) =>
        <Cell
          key={assignee.assigneeId}
          assignee={assignee}
          expanded={expanded} />
      )
    }
  </div>
)
