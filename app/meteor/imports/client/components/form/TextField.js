import React from 'react'
import MuiTextField from '@material-ui/core/TextField'

export const TextField = ({ meta, input, ...props }) =>
  <MuiTextField
    fullWidth
    margin='dense'
    error={meta && meta.touched && meta.invalid}
    helperText={meta && meta.touched && meta.error}
    {...input}
    {...props} />

// Shift+Enter to insert newline, just Enter to submit
export const handleKeyPress = submit => e => {
  const isEnter = e.charCode === 13
  const isNewline = isEnter && (e.ctrlKey || e.shiftKey || e.altKey)
  if (isEnter && !isNewline) {
    submit(e)
  }
}
