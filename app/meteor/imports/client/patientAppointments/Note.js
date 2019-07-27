import React from 'react'
import { withHandlers, compose } from 'recompose'
import { updateAppointment } from './updateAppointment'
import { Textarea } from './Field'

export const Note = compose(
  withHandlers({
    updateNote: props => note => updateAppointment(props, { note })
  })
)(({ _id, note, updateNote, isCurrent }) =>
  <Textarea
    autoFocus={isCurrent}
    initialValue={note}
    onChange={updateNote}
    style={isCurrent ? currentNoteStyle : noteStyle}
  />
)

const noteStyle = {
  outline: 0,
  paddingTop: 2,
  paddingBottom: 2,
  paddingLeft: 12,
  paddingRight: 12
}

const currentNoteStyle = {
  paddingTop: 13,
  paddingBottom: 13,
  paddingLeft: 15,
  paddingRight: 15
}
