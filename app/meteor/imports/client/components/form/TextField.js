import React from 'react'
import { TextField as MuiTextField } from 'redux-form-material-ui'

export const TextField = (props) =>
  <MuiTextField
    fullWidth
    margin='dense'
    {...props} />

// Shift+Enter to insert newline, just Enter to submit
export const handleKeyPress = submit => e => {
  const isEnter = e.charCode === 13
  const isNewline = isEnter && (e.ctrlKey || e.shiftKey || e.altKey)
  if (isEnter && !isNewline) {
    submit(e)
  }
}
