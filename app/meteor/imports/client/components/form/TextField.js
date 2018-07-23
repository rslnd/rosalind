import React from 'react'
import { TextField as MuiTextField } from 'redux-form-material-ui'

export const TextField = (props) =>
  <MuiTextField
    fullWidth
    margin='dense'
    {...props} />
