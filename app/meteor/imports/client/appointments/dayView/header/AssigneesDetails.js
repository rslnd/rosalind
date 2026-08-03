import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import { Icon } from '../../../components/Icon'
import { background, highlight, important, gray, grayActive, primary, primaryActive } from '../../../layout/styles'
import { InlineEdit } from '../../../components/form'
import { isNoteBarVisible } from './CalendarNote'
import { CalendarNoteLabel } from './CalendarNoteLabel'
import { LabelButton } from '../../../components/LabelButton'
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

const addInfoButtonStyle = {
  textTransform: 'none',
  fontSize: 11,
  lineHeight: 1.4,
  color: grayActive,
  borderColor: gray,
  backgroundColor: background,
  padding: '0px 6px',
  minWidth: 0,
  pointerEvents: 'auto'
}

// MUI Button styled via inline style can't express :hover/:active, so track the
// state manually and swap to the primary colors on hover / press.
const AddInfoButton = ({ onClick }) => {
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const color = active ? primaryActive : (hover ? primary : grayActive)
  const borderColor = active ? primaryActive : (hover ? primary : gray)

  return (
    <Button
      size='small'
      variant='outlined'
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false) }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{ ...addInfoButtonStyle, color, borderColor }}>
      <Icon name='plus' />&nbsp;Info hinzufügen
    </Button>
  )
}

const relevantCellStyle = {
  background,
  borderBottom: '1px solid #d2d6de',
  pointerEvents: 'auto'
}

export const BreakLines = ({ children, placeholder, isImportant = false }) =>
  (children && children.length >= 1)
    ? children.split('\n').map((t, i) => (
      <span
        key={i}
        style={{
          ...((children.indexOf('!') === -1 && !isImportant) ? highlight : important),
          // Break long words without spaces so they wrap inside the column
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          boxSizing: 'border-box',
          // Keep a consistent line height so the box does not shrink when the
          // note is shown inside a fullWidth InlineEdit (which tightens it)
          lineHeight: 1.4
        }}>{t}<br /></span>
    ))
    : (placeholder || null)

const Cell = ({ date, calendar, daySchedule, canEditSchedules, assignee, hovering, editing, open, onOpenPanel, onChangeNote, onChangeCalendarNote, onEditingChange, isLast }) => {
  const isDayNoteColumn = (!assignee || (!calendar.allowUnassigned && isLast))
  const hasDayNote = (daySchedule && (daySchedule.note || daySchedule.noteDetails))
  // The "Info hinzufügen" button depends on the Tagesinfo only (not on a possibly
  // leftover, no longer editable Details note), so it stays visible whenever the
  // Tagesinfo is empty.
  const hasTagesinfo = !!(daySchedule && daySchedule.note)
  // Expand the notes panel when editing, when opened via the "Info hinzufügen"
  // button, or on hover – for editors only when a note already exists; an empty
  // note is opened explicitly via the button so the button stays clickable.
  const isExpanded = editing || open || (hovering && (hasDayNote || !canEditSchedules))
  const style = (isDayNoteColumn && (canEditSchedules || hasDayNote))
    ? { ...relevantCellStyle, ...cellStyle }
    : cellStyle

  const checkups = isDayNoteColumn && Checkups.methods.getDue({ date })
  const hasCheckups = checkups.length >= 1

  // Label shown above the Tagesinfo field (in both the editing and the
  // non-editing state), mirroring the calendar note's CalendarNoteLabel.
  const tagesinfoLabel = (
    <div style={{ marginTop: 4, marginBottom: 4 }}>
      <LabelButton>Tagesinfo</LabelButton>
    </div>
  )

  // Day note
  const dayNote = (isDayNoteColumn && (hasDayNote || canEditSchedules))
    ? <div style={{ width: '100%' }}>
      {
        isExpanded && canEditSchedules && <div>
          <InlineEdit
            key={'note' + (daySchedule && daySchedule._id)}
            value={(daySchedule && daySchedule.note) || ''}
            rows={1}
            rowsMax={10}
            fullWidth
            submitOnBlur
            submitOnEnter
            onEditingChange={onEditingChange}
            editingHeader={tagesinfoLabel}
            onChange={note => onChangeNote({ ...(daySchedule || {}), note })}
          ><>
            {tagesinfoLabel}
            <BreakLines>{daySchedule && daySchedule.note}</BreakLines>
          </></InlineEdit>

          <br />
          <br />

          {/* Calendar note ("Wichtige Information") – shown on every day.
              The label text doubles as the click target to start editing. */}
          <InlineEdit
            key={'calendarNote' + (calendar && calendar._id)}
            value={(calendar && calendar.note) || ''}
            placeholder=''
            rows={1}
            rowsMax={10}
            fullWidth
            submitOnBlur
            submitOnEnter
            onEditingChange={onEditingChange}
            editingHeader={<div style={{ marginBottom: 4 }}><CalendarNoteLabel /></div>}
            onChange={note => onChangeCalendarNote && onChangeCalendarNote(note)}
          ><>
            <div style={{ marginBottom: 4 }}><CalendarNoteLabel /></div>
            <BreakLines>{calendar && calendar.note}</BreakLines>
          </></InlineEdit>

          {/* Details UI disabled (not deleted) – re-enable when needed
          <br />
          <br />

          <InlineEdit
            key={'noteDetails' + (daySchedule && daySchedule._id)}
            value={(daySchedule && daySchedule.noteDetails) || ''}
            placeholder='Details'
            rows={3}
            rowsMax={10}
            submitOnBlur
            submitOnMouseLeave
            onChange={noteDetails => onChangeNote({ ...(daySchedule || {}), noteDetails })}
          ><BreakLines placeholder='Details'>{daySchedule && daySchedule.noteDetails}</BreakLines></InlineEdit>
          */}
        </div>
      }
      {
        isExpanded && !canEditSchedules && hasDayNote && <div>
          <BreakLines>{daySchedule.note}</BreakLines>
          {daySchedule.noteDetails &&
            <p><BreakLines>{daySchedule.noteDetails}</BreakLines></p>
          }
        </div>
      }
      {
        !isExpanded && hasCheckups && <div>
          <BreakLines isImportant>{checkups.map(c => c.name).join('\n')}</BreakLines>
        </div>
      }
      {
        !isExpanded && hasDayNote && <div>
          <BreakLines>{daySchedule.note}</BreakLines>
        </div>
      }
      {
        !isExpanded && canEditSchedules && !hasTagesinfo && <div>
          <AddInfoButton onClick={onOpenPanel} />
        </div>
      }
    </div>
    : null

  return <div style={style}>
    { dayNote }
  </div>
}

export const AssigneesDetails = ({ date, calendar, daySchedule, assignees, hovering, editing, open, onOpenPanel, canEditSchedules, onChangeNote, onChangeCalendarNote, onEditingChange }) => (
  <div style={isNoteBarVisible({ calendar, canEditSchedules }) ? barStyleWithNote : barStyle}>
    {
      assignees.map((assignee, i) =>
        <Cell
          key={assignee ? assignee._id : 'unassigned'}
          date={date}
          calendar={calendar}
          canEditSchedules={canEditSchedules}
          onChangeNote={onChangeNote}
          onChangeCalendarNote={onChangeCalendarNote}
          onEditingChange={onEditingChange}
          onOpenPanel={onOpenPanel}
          assignee={assignee}
          hovering={hovering}
          editing={editing}
          open={open}
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
          onChangeCalendarNote={onChangeCalendarNote}
          onEditingChange={onEditingChange}
          onOpenPanel={onOpenPanel}
          assignee={{}}
          hovering={hovering}
          editing={editing}
          open={open}
          isLast
          daySchedule={daySchedule} />
    }
  </div>
)
