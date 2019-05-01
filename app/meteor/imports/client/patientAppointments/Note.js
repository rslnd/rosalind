import identity from 'lodash/identity'
import React from 'react'
import { withHandlers, compose } from 'recompose'
import { Comments } from '../../api/comments'
import { updateAppointment } from './updateAppointment'
import { Textarea } from './Field'
import { withTracker } from '../components/withTracker'

// This is a last resort fallback if the migration did not work as expected
// TODO: Remove after a few weeks in prod whithout 'Missing comments' errors
export const Note = compose(
  withTracker(props => {
    const comments = Comments.find({ docId: props._id }).fetch()

    const currentNote = props.note || ''
    const missingComments = comments.filter(c => currentNote.indexOf(c.body) === -1)

    if (missingComments.length > 0) {
      console.error(`Missing comments for apppointmentId ${props._id}`)
    }

    const note = [currentNote, missingComments].filter(identity).join('\n\n').trim()
    return { note }
  }),
  withHandlers({
    updateNote: props => note => updateAppointment(props, { note })
  })
)(({ _id, note, updateNote, isCurrent }) =>
  <Textarea
    blankRows={isCurrent ? 1 : 0}
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
