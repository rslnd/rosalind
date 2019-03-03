import React from 'react'
import { Icon } from '../../../components/Icon'
import { TagsList } from '../../../tags/TagsList'
import { background, highlight, important } from '../../../layout/styles'
import { InlineEdit } from '../../../components/form'
import { isNoteBarVisible } from './CalendarNote';

const barStyle = {
  position: 'fixed',
  pointerEvents: 'none',
  minHeight: 40,
  marginTop: 43,
  top: 44,
  right: 15,
  left: 60,
  zIndex: 39,
  paddingLeft: 60,
  display: 'flex',
  alignItems: 'flex-start'
}

const barStyleWithNote = {
  ...barStyle,
  marginTop: 80
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
  paddingTop: 6,
  paddingBottom: 6
}

const latchStyle = {
  marginTop: -5,
  height: 20
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
      constraint.tags && <div style={leftAlign}>
        <TagsList tiny tags={constraint.tags.map(t => t.tagId)} />
      </div>
    }
  </div>
)

export const BreakLines = ({ children, placeholder }) =>
  children
  ? children.split('\n').map((t, i) => (
    <span key={i} style={children.indexOf('!') === -1 ? highlight : important}>{t}<br /></span>
  ))
  : placeholder

const Cell = ({ calendar, daySchedule, canEditSchedules, assignee, expanded, onChangeNote, isLast }) => {
  const isDayNoteColumn = (!assignee.assigneeId || (!calendar.allowUnassigned && isLast))
  const hasDayNote = (daySchedule && (daySchedule.note || daySchedule.noteDetails))
  const style = (isDayNoteColumn && (canEditSchedules || hasDayNote))
    ? { ...relevantCellStyle, ...cellStyle }
    : cellStyle

  // Day note
  const dayNote = (isDayNoteColumn && (hasDayNote || canEditSchedules))
    ? <div>
      {
        expanded && canEditSchedules && <div>
          <InlineEdit
            value={daySchedule && daySchedule.note || ''}
            placeholder='Info'
            rows={3}
            rowsMax={10}
            submitOnBlur
            submitOnMouseLeave
            onChange={note => onChangeNote({ note })}
          ><BreakLines placeholder='Info'>{daySchedule && daySchedule.note}</BreakLines></InlineEdit>

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
          ><BreakLines placeholder='Details'>{daySchedule && daySchedule.noteDetails}</BreakLines></InlineEdit>
        </div>
      }
      {
        expanded && !canEditSchedules && hasDayNote && <div>
          <BreakLines>{daySchedule.note}</BreakLines>
          {daySchedule.noteDetails &&
            <p><BreakLines>{daySchedule.noteDetails}</BreakLines></p>
          }
        </div>
      }
      {
        !expanded && hasDayNote && <div>
          <BreakLines>{daySchedule.note}</BreakLines>
        </div>
      }
      {
        !expanded && canEditSchedules && !hasDayNote && <div style={latchStyle}>
          <Icon name='pencil' style={{ opacity: 0.2 }} />
        </div>
      }
    </div>
  : null

  return <div style={style}>
    { dayNote }
    {/* TODO: Remove constraints or put behind flag? Not sure if needed anymore */}
    {/* {
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
    } */}
  </div>
}

export const AssigneesDetails = ({ calendar, daySchedule, assignees, expanded, canEditSchedules, onChangeNote }) => (
  <div style={isNoteBarVisible({ calendar, canEditSchedules }) ? barStyleWithNote : barStyle}>
    {
      assignees.map((assignee, i) =>
        <Cell
          key={assignee.assigneeId}
          calendar={calendar}
          canEditSchedules={canEditSchedules}
          onChangeNote={onChangeNote}
          assignee={assignee}
          expanded={expanded}
          isLast={i === (assignees.length - 1)}
          daySchedule={daySchedule} />
      )
    }
    {
      assignees.length === 0 &&
        <Cell
          key={'note'}
          calendar={calendar}
          canEditSchedules={canEditSchedules}
          onChangeNote={onChangeNote}
          assignee={{}}
          expanded={expanded}
          isLast
          daySchedule={daySchedule} />
    }
  </div>
)
