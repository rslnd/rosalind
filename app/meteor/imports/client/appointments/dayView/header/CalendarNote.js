import React from 'react'
import { background, grayDisabled } from '../../../layout/styles'
import { InlineEdit } from '../../../components/form'
import { BreakLines } from './AssigneesDetails'

const barStyle = {
  backgroundColor: background,
  borderBottom: `1px solid ${grayDisabled}`,
  position: 'fixed',
  minHeight: 40,
  marginTop: 43,
  top: 44,
  right: 15,
  left: 60,
  zIndex: 39,
  paddingLeft: 64,
  paddingRight: 4,
  paddingTop: 11,
  paddingBottom: 1,
  display: 'flex'
}

// Only show the row when a calendar note ("Wichtige Information") is set
export const isNoteBarVisible = ({ calendar }) =>
  !!(calendar && calendar.note)

// Editable here too. Saved on blur/enter (no submitOnMouseLeave) so hovering does
// not overwrite the note. InlineEdit syncs its internal value on external changes
// (componentDidUpdate), so editing the same note in parallel in the notes panel
// does not lead to stale values.
export const CalendarNote = ({ calendar, canEditSchedules, onChangeNote }) =>
  isNoteBarVisible({ calendar }) && <div style={barStyle}>
    {
      canEditSchedules
        ? <InlineEdit
          key={calendar._id} // Fix weird note copying across calendars
          value={(calendar && calendar.note) || ''}
          rows={1}
          rowsMax={3}
          submitOnBlur
          submitOnEnter
          fullWidth
          onChange={newNote => onChangeNote(newNote)}
        ><BreakLines>{calendar && calendar.note}</BreakLines></InlineEdit>
        : <BreakLines>{calendar && calendar.note}</BreakLines>
    }
  </div>
