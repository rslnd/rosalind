import React from 'react'
import { withHandlers } from 'recompose'
import { Comments } from '../../api/comments'
import { updateAppointment } from './updateAppointment'
import { Textarea } from './Field'

// TODO: Find a way to migrate, or clean up?
export const Note = withHandlers({
  updateNote: props => note => updateAppointment(props, { note })
  // Comments.find({ docId: _id }).fetch().map(a => <div key={a._id}>{a.body}</div>
})(({ _id, note, updateNote }) =>
  <Textarea
    initialValue={note}
    onChange={updateNote}
    style={noteStyle}
  />
)

const noteStyle = {
  outline: 0,
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 15,
  paddingRight: 15
}
