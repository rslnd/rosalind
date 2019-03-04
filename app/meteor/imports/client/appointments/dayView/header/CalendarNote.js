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

const alwaysShow = true

export const isNoteBarVisible = ({ calendar, canEditSchedules }) =>
  (canEditSchedules || (calendar && calendar.note) || alwaysShow)

export const CalendarNote = ({ calendar, canEditSchedules, onChangeNote }) =>
  isNoteBarVisible({ calendar, canEditSchedules }) && <div style={barStyle}>
    {
      canEditSchedules
        ? <InlineEdit
          key={calendar._id} // Fix weird note copying across calendars
          value={(calendar && calendar.note) || ''}
          placeholder='Info'
          rows={1}
          rowsMax={3}
          submitOnBlur
          submitOnMouseLeave
          fullWidth
          onChange={newNote => onChangeNote(newNote)}
        ><BreakLines placeholder='Info'>{calendar && calendar.note}</BreakLines></InlineEdit>
        : <BreakLines placeholder='Info'>{calendar && calendar.note}</BreakLines>
    }
  </div>
