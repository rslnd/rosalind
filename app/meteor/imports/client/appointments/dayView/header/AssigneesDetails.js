import React from 'react'
import { Icon } from '../../../components/Icon'
import { background, highlight, important } from '../../../layout/styles'
import { InlineEdit } from '../../../components/form'
import { isNoteBarVisible } from './CalendarNote'
import { Checkups } from '../../../../api/checkups'

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

export const BreakLines = ({ children, placeholder, isImportant = false }) =>
  (children && children.length >= 1)
    ? children.split('\n').map((t, i) => (
      <span key={i} style={(children.indexOf('!') === -1 && !isImportant) ? highlight : important}>{t}<br /></span>
    ))
    : (placeholder || null)

const Cell = ({ date, calendar, daySchedule, canEditSchedules, assignee, expanded, onChangeNote, isLast }) => {
  const isDayNoteColumn = (!assignee || (!calendar.allowUnassigned && isLast))
  const hasDayNote = (daySchedule && (daySchedule.note || daySchedule.noteDetails))
  const style = (isDayNoteColumn && (canEditSchedules || hasDayNote))
    ? { ...relevantCellStyle, ...cellStyle }
    : cellStyle

  const checkups = isDayNoteColumn && Checkups.methods.getDue({ date })
  const hasCheckups = checkups.length >= 1

  // Day note
  const dayNote = (isDayNoteColumn && (hasDayNote || canEditSchedules))
    ? <div>
      {
        expanded && canEditSchedules && <div>
          <InlineEdit
            value={(daySchedule && daySchedule.note) || ''}
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
            value={(daySchedule && daySchedule.noteDetails) || ''}
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
        !expanded && hasCheckups && <div>
          <BreakLines isImportant>{checkups.map(c => c.name).join('\n')}</BreakLines>
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
  </div>
}

export const AssigneesDetails = ({ date, calendar, daySchedule, assignees, expanded, canEditSchedules, onChangeNote }) => (
  <div style={isNoteBarVisible({ calendar, canEditSchedules }) ? barStyleWithNote : barStyle}>
    {
      assignees.map((assignee, i) =>
        <Cell
          key={assignee ? assignee._id : 'unassigned'}
          date={date}
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
          date={date}
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
