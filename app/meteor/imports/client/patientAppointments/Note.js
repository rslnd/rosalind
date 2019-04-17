import React from 'react'
import { Comments } from '../../api/comments'

// TODO: Find a way to migrate, or clean up?
export const Note = ({ _id, note }) =>
  <div style={noteStyle}>
    {note || <div>&emsp;</div>}
    {Comments.find({ docId: _id }).fetch().map(a => <div key={a._id}>{a.body}</div>)}
  </div>

const noteStyle = {
  outline: 0,
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 15,
  paddingRight: 15
}
