import React from 'react'
import { Icon } from '../../../components/Icon'
import { TagsList } from '../../../tags/TagsList'
import { background } from '../../../css/global'
import { InlineEdit } from '../../../components/form'

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

const Cell = ({ daySchedule, canEditSchedules, assignee, expanded, onChangeNote }) => {
  const isRelevant = (assignee.constraints && assignee.constraints.length > 0)
  const unassigned = !assignee.assigneeId
  const hasDayNote = (daySchedule && (daySchedule.note || daySchedule.noteDetails))
  const style = (isRelevant || (unassigned && (canEditSchedules || hasDayNote)))
    ? { ...relevantCellStyle, ...cellStyle }
    : cellStyle

  // Day note
  if (unassigned && (hasDayNote || canEditSchedules)) {
    return <div style={style}>
      {
        expanded && canEditSchedules && <div>
          <InlineEdit
            value={daySchedule && daySchedule.note || ''}
            placeholder='Info'
            submitOnBlur
            submitOnMouseLeave
            onChange={note => onChangeNote({ note })}
          />

          <br />
          <br />

          <InlineEdit
            value={daySchedule && daySchedule.noteDetails || ''}
            placeholder='Details'
            rows={3}
            rowsMax={10}
            submitOnBlur
            submitOnMouseLeave
            onChange={noteDetails => onChangeNote({ noteDetails })}
          />
        </div>
      }
      {
        expanded && !canEditSchedules && hasDayNote && <div>
          {daySchedule.note}
          {daySchedule.noteDetails &&
            <p>{daySchedule.noteDetails}</p>
          }
        </div>
      }
      {
        !expanded && hasDayNote && <div>
          {daySchedule.note}
        </div>
      }
      {
        !expanded && canEditSchedules && !hasDayNote && <div>
          <Icon name='pencil' style={{ opacity: 0.2 }} />
        </div>
      }
    </div>
  }

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

export const AssigneesDetails = ({ daySchedule, assignees, expanded, canEditSchedules, onChangeNote }) => (
  <div style={barStyle}>
    {
      assignees.map((assignee) =>
        <Cell
          key={assignee.assigneeId}
          canEditSchedules={canEditSchedules}
          onChangeNote={onChangeNote}
          assignee={assignee}
          expanded={expanded}
          daySchedule={daySchedule} />
      )
    }
  </div>
)
