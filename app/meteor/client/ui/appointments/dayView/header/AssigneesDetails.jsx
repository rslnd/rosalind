import React from 'react'
import { Icon } from 'client/ui/components/Icon'

const bar = {
  height: 40,
  marginTop: 43,
  position: 'relative',
  top: 60,
  paddingLeft: 60,
  display: 'flex'
}

const cell = {
  flex: 1,
  borderLeft: '1px solid #d2d6de',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
}

const Constraint = ({ constraint }) => (
  <div>
    {
      constraint.length
      ? <span>
        <Icon name="clock-o" /> {constraint.length} min {constraint.note && <span>&middot; {constraint.note}</span>}
      </span>
      : <span>
        <Icon name="info-circle" /> {constraint.note}
      </span>
    }
  </div>
)

export const AssigneesDetails = ({ assignees }) => (
  <div style={bar}>
    {
      assignees.map((assignee) => (
        <div
          key={assignee.assigneeId}
          className="text-muted"
          style={cell}>
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
